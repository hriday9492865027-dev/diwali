"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ParticleState, PhotoAsset } from "@/lib/particles/types";
import { processImageToParticleBuffers } from "@/lib/particles/saliency";
import { portraitVertexShader, portraitFragmentShader } from "@/lib/particles/shaders";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import { Sparkles, ArrowLeft, Volume2, VolumeX, RotateCw, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface ParticlePortraitEngineProps {
  photos: PhotoAsset[];
  studentName: string;
}

export function ParticlePortraitEngine({ photos, studentName }: ParticlePortraitEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<ParticleState>("READY");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  const loadPhotoToGeometry = useCallback(async (photoUrl: string) => {
    setIsLoadingImage(true);
    try {
      const isMobile = window.innerWidth < 768;
      const budget = isMobile ? 4500 : 9000;
      const buffers = await processImageToParticleBuffers(photoUrl, budget);

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
  }, []);

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
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    rendererRef.current = renderer;

    // 3. Shader Material for Portrait Particles
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

    // Load initial photo
    if (photos.length > 0) {
      loadPhotoToGeometry(photos[0].url);
    }

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

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
        // Dissolve outward over 1.0s
        const dissolveDur = 1.0;
        const progress = Math.min(elapsedInState / dissolveDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uDissolveProgress.value = progress;
        }

        if (progress >= 1.0) {
          // Advance to next photo and trigger next rocket launch
          const nextIdx = (currentPhotoIndex + 1) % photos.length;
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

  // User click action: FIRE or NEXT PORTRAIT
  const handleFire = () => {
    if (isProcessing || isLoadingImage) return;

    setIsProcessing(true);

    if (state === "PORTRAIT_IDLE") {
      // Graceful dissolve before next photo
      setState("PARTICLE_DISSOLVE");
      stateStartTimeRef.current = performance.now();
    } else {
      // First launch from READY
      setState("ROCKET_LAUNCH");
      stateStartTimeRef.current = performance.now();
      playSound("rocket");
      if (materialRef.current) {
        materialRef.current.uniforms.uMorphProgress.value = 0.0;
        materialRef.current.uniforms.uDissolveProgress.value = 0.0;
      }
    }
  };

  const currentCaption = photos[currentPhotoIndex]?.caption;

  return (
    <div ref={containerRef} className="relative w-full h-[82vh] md:h-[86vh] flex flex-col justify-between overflow-hidden select-none">
      {/* Three.js Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* Top Controls Overlay */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        {/* Current Photo Sequence Counter */}
        {photos.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 text-xs font-semibold text-diwali-gold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>
              Memory {currentPhotoIndex + 1} of {photos.length}
            </span>
          </div>
        )}

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-gold hover:bg-black/60 transition-colors"
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Control Bar */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-3 p-6 text-center">
        {/* Caption & Status */}
        {currentCaption && state === "PORTRAIT_IDLE" && (
          <div className="px-4 py-1.5 rounded-full bg-black/60 border border-diwali-gold/30 text-xs text-diwali-gold tracking-wide animate-fade-in shadow-glow-gold">
            {currentCaption}
          </div>
        )}

        {/* Trigger Button: Fire / Next Memory */}
        <div className="flex items-center gap-4">
          <DiwaliButton
            size="lg"
            onClick={handleFire}
            isLoading={isProcessing || isLoadingImage}
            className="min-w-[220px]"
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
        </div>

        <p className="text-[11px] text-diwali-muted/70 tracking-wider">
          {state === "PORTRAIT_IDLE"
            ? "Your memories sculpted purely from light particles. Click to advance to your next portrait."
            : "Click launch to ascend a celebratory rocket and sculpt your portrait in starlight."}
        </p>
      </div>
    </div>
  );
}
