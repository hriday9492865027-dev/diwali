"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ParticleState, PhotoAsset } from "@/lib/particles/types";
import { processImageToParticleBuffers } from "@/lib/particles/saliency";
import { portraitVertexShader, portraitFragmentShader } from "@/lib/particles/shaders";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import {
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCw,
  Image as ImageIcon,
  Download,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface ParticlePortraitEngineProps {
  photos: PhotoAsset[];
  initialIndex?: number;
  studentName?: string;
  mode?: "portrait" | "rangoli";
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  autoLaunch?: boolean;
  onSelectPhoto?: (index: number) => void;
  onDeletePhoto?: (id: string) => void;
}

export function ParticlePortraitEngine({
  photos,
  initialIndex = 0,
  studentName,
  mode = "portrait",
  title,
  subtitle,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  autoLaunch = false,
  onSelectPhoto,
  onDeletePhoto,
}: ParticlePortraitEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<ParticleState>("READY");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(
    initialIndex >= 0 && initialIndex < photos.length ? initialIndex : 0
  );
  const targetPhotoIndexRef = useRef<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const rocketMeshRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // State animation timing tracking
  const stateRef = useRef<ParticleState>("READY");
  stateRef.current = state;
  const stateStartTimeRef = useRef<number>(0);

  // Sound generator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSound = (type: "rocket" | "explosion") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (type === "rocket") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === "explosion") {
        const bufferSize = ctx.sampleRate * 0.9;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(380, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }
    } catch {
      // Best-effort audio
    }
  };

  // Helper to load photo and build particle geometry
  const loadPhotoToGeometry = useCallback(
    async (photoUrl: string) => {
      setIsLoadingImage(true);
      try {
        const isMobile = window.innerWidth < 768;
        const defaultBudget = isMobile ? 5000 : 10000;
        const budget = mode === "rangoli" ? (isMobile ? 6500 : 12000) : defaultBudget;
        const buffers = await processImageToParticleBuffers(photoUrl, budget, mode);

        if (!geometryRef.current) {
          geometryRef.current = new THREE.BufferGeometry();
        }

        const geom = geometryRef.current;
        geom.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3));
        geom.setAttribute("targetPosition", new THREE.BufferAttribute(buffers.targetPositions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 3));
        geom.setAttribute("size", new THREE.BufferAttribute(buffers.sizes, 1));
        geom.setAttribute("alpha", new THREE.BufferAttribute(buffers.alphas, 1));

        geom.attributes.position.needsUpdate = true;
        geom.attributes.targetPosition.needsUpdate = true;
        geom.attributes.color.needsUpdate = true;

        setIsLoadingImage(false);
        return true;
      } catch (err) {
        console.error("Failed to load photo buffers:", err);
        setIsLoadingImage(false);
        return false;
      }
    },
    [mode]
  );

  // Initialize Three.js Scene, Camera, and Renderer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 6.0;
    cameraRef.current = camera;

    // 2. WebGL2 Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    rendererRef.current = renderer;

    // 3. Shader Material for Portrait/Rangoli Particles
    const material = new THREE.ShaderMaterial({
      vertexShader: portraitVertexShader,
      fragmentShader: portraitFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0.0 },
        uDissolveProgress: { value: 0.0 },
        uNoiseStrength: { value: 1.0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(-999, -999) },
        uMouseRadius: { value: 0.75 },
        uMouseStrength: { value: 0.16 },
      },
    });
    materialRef.current = material;

    // 4. Initial Points Mesh
    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;
    const points = new THREE.Points(geometry, material);
    pointsMeshRef.current = points;
    scene.add(points);

    // 5. Rocket Mesh Group (ascending visual)
    const rocketGroup = new THREE.Group();
    rocketGroup.visible = false;

    // Rocket Body Cone
    const coneGeom = new THREE.ConeGeometry(0.08, 0.28, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const coneMesh = new THREE.Mesh(coneGeom, coneMat);
    coneMesh.rotation.x = Math.PI;
    rocketGroup.add(coneMesh);

    // Rocket Flame Tail
    const tailGeom = new THREE.CylinderGeometry(0.02, 0.08, 0.35, 8);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xea580c });
    const tailMesh = new THREE.Mesh(tailGeom, tailMat);
    tailMesh.position.y = -0.25;
    rocketGroup.add(tailMesh);

    rocketMeshRef.current = rocketGroup;
    scene.add(rocketGroup);

    // Load initial image
    const startIdx = initialIndex >= 0 && initialIndex < photos.length ? initialIndex : 0;
    if (photos.length > 0) {
      loadPhotoToGeometry(photos[startIdx].url);
    }

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsedTime;
      }

      // State Machine Transition Logic
      const currentState = stateRef.current;
      const now = performance.now();
      const elapsedInState = (now - stateStartTimeRef.current) / 1000;

      if (currentState === "ROCKET_LAUNCH") {
        if (rocketMeshRef.current) {
          rocketMeshRef.current.visible = true;
          // Ascend from bottom (-3.5) to center (0.5) over 1.2s
          const progress = Math.min(elapsedInState / 1.2, 1.0);
          const easeY = -3.5 + Math.sin(progress * Math.PI * 0.5) * 4.0;
          rocketMeshRef.current.position.y = easeY;
          rocketMeshRef.current.position.x = Math.sin(progress * 4.0) * 0.1;

          if (progress >= 1.0) {
            // Rocket reached apex -> Trigger Explosion
            rocketMeshRef.current.visible = false;
            playSound("explosion");
            setState("EXPLOSION");
            stateStartTimeRef.current = performance.now();
          }
        }
      } else if (currentState === "EXPLOSION") {
        // Explosion burst lasts 0.3s before dispersion & reconstruction starts
        if (elapsedInState > 0.3) {
          setState("IMAGE_RECONSTRUCTION");
          stateStartTimeRef.current = performance.now();
        }
      } else if (currentState === "IMAGE_RECONSTRUCTION") {
        // Morph progress travels 0.0 -> 1.0 over 2.2 seconds
        const morphDur = 2.2;
        const progress = Math.min(elapsedInState / morphDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uMorphProgress.value = progress;
          materialRef.current.uniforms.uDissolveProgress.value = 0.0;
        }

        if (progress >= 1.0) {
          setState("PORTRAIT_IDLE");
          stateStartTimeRef.current = performance.now();
          setIsProcessing(false);
        }
      } else if (currentState === "PARTICLE_DISSOLVE") {
        // Dissolve outward smoothly over 0.75s
        const dissolveDur = 0.75;
        const progress = Math.min(elapsedInState / dissolveDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uDissolveProgress.value = progress;
        }

        if (progress >= 1.0) {
          // Advance to targeted or next photo and trigger rocket launch
          const nextIdx =
            targetPhotoIndexRef.current !== null
              ? targetPhotoIndexRef.current
              : (currentPhotoIndex + 1) % photos.length;
          targetPhotoIndexRef.current = null;
          setCurrentPhotoIndex(nextIdx);
          loadPhotoToGeometry(photos[nextIdx].url).then(() => {
            setState("ROCKET_LAUNCH");
            stateStartTimeRef.current = performance.now();
            playSound("rocket");
            if (materialRef.current) {
              materialRef.current.uniforms.uMorphProgress.value = 0.0;
              materialRef.current.uniforms.uDissolveProgress.value = 0.0;
            }
          });
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (materialRef.current) {
        materialRef.current.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [photos, loadPhotoToGeometry]);

  // Trigger launch helper
  const triggerLaunch = () => {
    setState("ROCKET_LAUNCH");
    stateStartTimeRef.current = performance.now();
    playSound("rocket");
    if (materialRef.current) {
      materialRef.current.uniforms.uMorphProgress.value = 0.0;
      materialRef.current.uniforms.uDissolveProgress.value = 0.0;
    }
  };

  // Auto-launch on mount if requested
  useEffect(() => {
    if (autoLaunch && photos.length > 0) {
      const timer = setTimeout(() => {
        triggerLaunch();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoLaunch, photos.length]);

  // User click action: FIRE or NEXT PORTRAIT
  const handleFire = () => {
    if (isProcessing || isLoadingImage) return;

    setIsProcessing(true);

    if (stateRef.current === "PORTRAIT_IDLE") {
      // Graceful dissolve before next photo
      targetPhotoIndexRef.current = (currentPhotoIndex + 1) % photos.length;
      setState("PARTICLE_DISSOLVE");
      stateStartTimeRef.current = performance.now();
    } else {
      triggerLaunch();
    }
  };

  // Select a specific saved Rangoli or photo and detonate immediately
  const selectPhoto = (targetIdx: number) => {
    if (isProcessing || isLoadingImage || targetIdx < 0 || targetIdx >= photos.length) return;

    setIsProcessing(true);
    setCurrentPhotoIndex(targetIdx);

    if (onSelectPhoto) {
      onSelectPhoto(targetIdx);
    }

    if (stateRef.current === "PORTRAIT_IDLE") {
      targetPhotoIndexRef.current = targetIdx;
      setState("PARTICLE_DISSOLVE");
      stateStartTimeRef.current = performance.now();
    } else {
      targetPhotoIndexRef.current = null;
      loadPhotoToGeometry(photos[targetIdx].url).then(() => {
        triggerLaunch();
      });
    }
  };

  // Interactive Forcefield Mouse Displacement
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !materialRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Perspective projection at z=6.0, fov=45
    const aspect = rect.width / rect.height;
    const vFovRad = (45 * Math.PI) / 360;
    const halfH = Math.tan(vFovRad) * 6.0;
    const halfW = halfH * aspect;

    materialRef.current.uniforms.uMouse.value.set(ndcX * halfW, ndcY * halfH);
  };

  const handlePointerLeave = () => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMouse.value.set(-999, -999);
    }
  };

  // Souvenir Snapshot Generator
  const handleDownloadSouvenir = () => {
    if (!canvasRef.current) return;
    const srcCanvas = canvasRef.current;
    const souvenir = document.createElement("canvas");
    souvenir.width = 1080;
    souvenir.height = 1350;
    const ctx = souvenir.getContext("2d");
    if (!ctx) return;

    // 1. Dark festive background
    const bgGrad = ctx.createRadialGradient(540, 675, 50, 540, 675, 750);
    bgGrad.addColorStop(0, "#161b33");
    bgGrad.addColorStop(0.5, "#0b0f19");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Golden Ornamental Borders
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 1080 - 72, 1350 - 72);

    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(46, 46, 1080 - 92, 1350 - 92);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 0);
      ctx.arc(0, 0, 14, 0, Math.PI / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(56, 56, 0);
    drawCorner(1080 - 56, 56, Math.PI / 2);
    drawCorner(1080 - 56, 1350 - 56, Math.PI);
    drawCorner(56, 1350 - 56, -Math.PI / 2);

    // 3. Render WebGL Particle Canvas Snapshot
    const pW = 860;
    const pH = 860;
    const pX = (1080 - pW) / 2;
    const pY = 160;
    ctx.drawImage(srcCanvas, pX, pY, pW, pH);

    // 4. Festive Typography
    ctx.textAlign = "center";
    ctx.font = "bold 32px 'Cinzel', Georgia, serif";
    ctx.fillStyle = "#f59e0b";
    ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("SHUBH DEEPAVALI", 540, 1080);
    ctx.shadowBlur = 0;

    ctx.font = "italic 22px 'Cinzel', Georgia, serif";
    ctx.fillStyle = "#fef08a";
    const headerTitle =
      mode === "rangoli"
        ? currentCaption || "Celestial Rangoli Fireworks"
        : studentName
        ? `Celebrating ${studentName}`
        : "Festival of Lights";
    ctx.fillText(headerTitle, 540, 1125);

    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(253, 251, 247, 0.6)";
    ctx.fillText(
      mode === "rangoli"
        ? "Sacred Symmetrical Light Constellation • Diwali 2026"
        : "Sculpted in Starlight • Diwali 2026",
      540,
      1170
    );

    // 5. Download Action
    const link = document.createElement("a");
    link.download =
      mode === "rangoli"
        ? `diwali-rangoli-fireworks-${Date.now()}.png`
        : `deepavali-portrait-${Date.now()}.png`;
    link.href = souvenir.toDataURL("image/png");
    link.click();
  };

  const currentCaption = photos[currentPhotoIndex]?.caption;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[88vh] md:h-[90vh] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Three.js Particle Canvas with Interactive Forcefield */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto cursor-crosshair"
      />

      {/* Top Controls Overlay */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between p-4 gap-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold hover:bg-black/60 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>

        {/* Title / Counter */}
        <div className="text-center">
          <h2 className="text-sm md:text-base font-bold tracking-[0.16em] text-gold-gradient uppercase">
            {title || (mode === "rangoli" ? "Celestial Rangoli Fireworks" : "Particle Portrait")}
          </h2>
          <p className="text-[10px] text-diwali-muted">
            {subtitle || (mode === "rangoli" ? "Cracker Burst in Rangoli Geometry" : "Sculpted in Cosmic Light")}
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-gold hover:bg-black/60 transition-colors"
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Interface: Mode-Specific Gallery or Standard Portrait Controls */}
      {mode === "rangoli" ? (
        /* Rangoli Mode: Saved Arts Drawer with Click-to-Blast Action */
        <div className="relative z-20 w-full max-w-5xl mx-auto p-4 pointer-events-auto">
          <div className="p-3.5 md:p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-diwali-gold/35 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-diwali-gold animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-diwali-gold font-bold">
                  Saved Rangoli Gallery ({photos.length})
                </span>
                <span className="text-[10px] text-diwali-muted hidden sm:inline">
                  — Tap any art to fire crackers in its design!
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectPhoto(currentPhotoIndex)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-diwali-gold text-diwali-night hover:scale-105 active:scale-95 transition-all shadow-glow-gold disabled:opacity-50"
                  title="Re-launch cracker rocket into active Rangoli"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Replay Blast</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSouvenir}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 border border-diwali-gold/40 text-diwali-gold hover:bg-diwali-gold/20 transition-all"
                  title="Save celestial fireworks souvenir snapshot"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Snapshot</span>
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Thumbnails Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
              {photos.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => selectPhoto(idx)}
                  className={`flex-shrink-0 cursor-pointer rounded-xl p-1.5 border transition-all duration-300 flex items-center gap-2.5 ${
                    currentPhotoIndex === idx
                      ? "bg-diwali-gold/20 border-diwali-gold shadow-glow-gold scale-105 ring-1 ring-diwali-gold"
                      : "bg-black/50 border-white/15 hover:border-diwali-gold/50 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.caption || `Rangoli ${idx + 1}`}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-900 border border-white/10"
                  />
                  <div className="text-left pr-1">
                    <p className="text-[11px] font-bold text-diwali-ivory max-w-[120px] truncate">
                      {item.caption || `Rangoli #${idx + 1}`}
                    </p>
                    <p className="text-[9px] text-diwali-gold font-mono uppercase">
                      {currentPhotoIndex === idx ? "✨ Active Burst" : "Tap to Fire"}
                    </p>
                  </div>
                  {onDeletePhoto && photos.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePhoto(item.id);
                      }}
                      className="p-1 rounded-md text-red-400 hover:bg-red-950/60 opacity-60 hover:opacity-100 transition-opacity"
                      title="Delete saved Rangoli"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              <Link
                href="/activities/rangoli"
                className="flex-shrink-0 px-3.5 py-3 rounded-xl border border-dashed border-diwali-gold/40 hover:border-diwali-gold bg-diwali-gold/5 hover:bg-diwali-gold/15 text-diwali-gold text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Draw New</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Portrait Mode: Standard Single/Sequence Controls */
        <div className="relative z-20 w-full max-w-lg mx-auto flex flex-col items-center gap-3 p-6 text-center">
          {currentCaption && state === "PORTRAIT_IDLE" && (
            <div className="px-4 py-1.5 rounded-full bg-black/60 border border-diwali-gold/30 text-xs text-diwali-gold tracking-wide animate-fade-in shadow-glow-gold">
              {currentCaption}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <DiwaliButton
              size="lg"
              onClick={handleFire}
              isLoading={isProcessing || isLoadingImage}
              className="min-w-[210px]"
            >
              {state === "READY" ? (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Firecracker</span>
                </span>
              ) : state === "PORTRAIT_IDLE" ? (
                <span className="inline-flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  <span>Reconstruct Next Memory</span>
                </span>
              ) : (
                <span>Reconstructing Light...</span>
              )}
            </DiwaliButton>

            {state === "PORTRAIT_IDLE" && (
              <button
                onClick={handleDownloadSouvenir}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-black/50 border border-diwali-gold/50 text-xs font-semibold text-diwali-gold hover:bg-diwali-gold/20 hover:scale-105 active:scale-95 transition-all shadow-glow-gold"
                title="Download High-Res Festive Souvenir"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Souvenir</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-diwali-muted/70 tracking-wider">
            {state === "PORTRAIT_IDLE"
              ? "Hover or drag your cursor to interact with the starlight field. Click Save Souvenir to download your festive portrait."
              : "Click launch to ascend a celebratory rocket and sculpt your portrait in starlight."}
          </p>
        </div>
      )}
    </div>
  );
}
