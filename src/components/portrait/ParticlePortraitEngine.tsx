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
  const trailGeomRef = useRef<THREE.BufferGeometry | null>(null);
  const trailMeshRef = useRef<THREE.Points | null>(null);
  const trailSparksRef = useRef<
    {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
      size: number;
      r: number;
      g: number;
      b: number;
    }[]
  >([]);
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
        // 1. Whistling rocket ascent
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.15);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.15);

        // 2. Fiery rocket roar / sizzle exhaust
        const bufSize = Math.floor(ctx.sampleRate * 1.15);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          d[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 80));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(950, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.045, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.15);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();
      } else if (type === "explosion") {
        // Deep bass detonation thud
        const bufferSize = Math.floor(ctx.sampleRate * 1.2);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(420, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.42, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        // High sparkle crackle burst
        const crackleSize = Math.floor(ctx.sampleRate * 0.6);
        const crackleBuf = ctx.createBuffer(1, crackleSize, ctx.sampleRate);
        const cData = crackleBuf.getChannelData(0);
        for (let i = 0; i < crackleSize; i++) {
          cData[i] = Math.random() > 0.88 ? (Math.random() * 2 - 1) : 0;
        }
        const cSource = ctx.createBufferSource();
        cSource.buffer = crackleBuf;
        const cFilter = ctx.createBiquadFilter();
        cFilter.type = "highpass";
        cFilter.frequency.setValueAtTime(2400, ctx.currentTime);
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.18, ctx.currentTime + 0.05);
        cGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        cSource.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(ctx.destination);
        cSource.start(ctx.currentTime + 0.04);
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
        uBlastProgress: { value: 0.0 },
        uFallProgress: { value: 0.0 },
        uExplosionProgress: { value: 0.0 },
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

    // 4. Initial Points Mesh (Hidden initially until rocket detonates at apex)
    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;
    const points = new THREE.Points(geometry, material);
    points.visible = false;
    pointsMeshRef.current = points;
    scene.add(points);

    // 5. Rocket Tracer Group: slender, needle-thin luminous comet streak matching video
    const rocketGroup = new THREE.Group();
    rocketGroup.visible = false;

    // Slender vertical quad ribbon (width 0.035, height 0.55)
    // Tapered luminous light streak: white-hot glint at tip, fading downward into warm gold
    const tracerGeom = new THREE.PlaneGeometry(0.035, 0.55);
    tracerGeom.translate(0, -0.275, 0); // Origin (0,0,0) is at the leading rocket tip
    const tracerMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float hDist = abs(vUv.x - 0.5) * 2.0;
          float taper = mix(0.25, 1.0, vUv.y);
          float horizontalCore = smoothstep(1.0, 0.0, hDist / taper);
          float verticalFade = pow(vUv.y, 1.7);
          vec3 tipColor = vec3(1.0, 0.99, 0.95);
          vec3 tailColor = vec3(1.0, 0.65, 0.15);
          vec3 color = mix(tailColor, tipColor, pow(vUv.y, 2.0));
          float alpha = horizontalCore * verticalFade * 0.95;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const tracerMesh = new THREE.Mesh(tracerGeom, tracerMat);
    rocketGroup.add(tracerMesh);

    // Pinpoint white-hot leading spark glint at tip (0, 0, 0)
    const tipSparkGeom = new THREE.BufferGeometry();
    tipSparkGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const tipSparkMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uPixelRatio;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(18.0 * (22.0 / -mvPosition.z) * uPixelRatio, 3.0, 36.0);
        }
      `,
      fragmentShader: `
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = smoothstep(0.18, 0.0, dist);
          float glow = smoothstep(0.5, 0.05, dist);
          vec3 col = mix(vec3(1.0, 0.85, 0.3), vec3(1.0, 1.0, 1.0), core);
          gl_FragColor = vec4(col, core + glow * 0.7);
        }
      `,
    });
    const tipSparkMesh = new THREE.Points(tipSparkGeom, tipSparkMat);
    rocketGroup.add(tipSparkMesh);

    rocketMeshRef.current = rocketGroup;
    scene.add(rocketGroup);

    // 6. Dynamic Cascading Spark Trail for Firecracker Rocket
    const MAX_TRAIL_SPARKS = 100;
    const trailPositions = new Float32Array(MAX_TRAIL_SPARKS * 3);
    const trailColors = new Float32Array(MAX_TRAIL_SPARKS * 3);
    const trailSizes = new Float32Array(MAX_TRAIL_SPARKS);
    const trailAlphas = new Float32Array(MAX_TRAIL_SPARKS);

    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
    trailGeometry.setAttribute("size", new THREE.BufferAttribute(trailSizes, 1));
    trailGeometry.setAttribute("alpha", new THREE.BufferAttribute(trailAlphas, 1));
    trailGeomRef.current = trailGeometry;

    const trailMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uPixelRatio;
        attribute float size;
        attribute float alpha;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(size * (22.0 / -mvPosition.z) * uPixelRatio, 1.5, 30.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = smoothstep(0.18, 0.0, dist);
          float glow = smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(vColor, vAlpha * (core * 0.7 + glow * 0.5));
        }
      `,
    });

    const trailMesh = new THREE.Points(trailGeometry, trailMaterial);
    trailMesh.visible = false;
    trailMeshRef.current = trailMesh;
    scene.add(trailMesh);

    // Load initial image
    const startIdx = initialIndex >= 0 && initialIndex < photos.length ? initialIndex : 0;
    if (photos.length > 0) {
      loadPhotoToGeometry(photos[startIdx].url);
    }

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsedTime;
      }

      // State Machine Transition Logic
      const currentState = stateRef.current;
      const now = performance.now();
      const elapsedInState = (now - stateStartTimeRef.current) / 1000;

      // Trailing spark emission during ROCKET_LAUNCH
      if (currentState === "ROCKET_LAUNCH" && rocketMeshRef.current) {
        const rPos = rocketMeshRef.current.position;
        // Spawn 3-4 golden trailing sparks per frame at rocket nozzle
        for (let s = 0; s < 3; s++) {
          if (trailSparksRef.current.length < MAX_TRAIL_SPARKS) {
            const isWhiteHot = Math.random() < 0.28;
            trailSparksRef.current.push({
              x: rPos.x + (Math.random() - 0.5) * 0.04,
              y: rPos.y - 0.12 - Math.random() * 0.08,
              z: rPos.z + (Math.random() - 0.5) * 0.04,
              vx: (Math.random() - 0.5) * 0.35,
              vy: -1.8 - Math.random() * 2.8,
              vz: (Math.random() - 0.5) * 0.35,
              life: 0,
              maxLife: 0.35 + Math.random() * 0.45,
              size: Math.random() * 1.8 + 1.2,
              r: 1.0,
              g: isWhiteHot ? 0.96 : 0.65 + Math.random() * 0.25,
              b: isWhiteHot ? 0.85 : 0.1,
            });
          }
        }
      }

      // Update active trailing sparks
      let activeTrailCount = 0;
      const sparks = trailSparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spk = sparks[i];
        spk.life += delta;
        if (spk.life >= spk.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        spk.x += spk.vx * delta;
        spk.y += spk.vy * delta;
        spk.z += spk.vz * delta;
        spk.vy -= 4.5 * delta; // Downward gravity acceleration
        spk.vx += (Math.random() - 0.5) * 0.25 * delta; // Air flutter

        const lifeNorm = spk.life / spk.maxLife;
        const alpha = (1.0 - lifeNorm) * 0.95;

        trailPositions[activeTrailCount * 3] = spk.x;
        trailPositions[activeTrailCount * 3 + 1] = spk.y;
        trailPositions[activeTrailCount * 3 + 2] = spk.z;

        trailColors[activeTrailCount * 3] = spk.r;
        trailColors[activeTrailCount * 3 + 1] = spk.g;
        trailColors[activeTrailCount * 3 + 2] = spk.b;

        trailSizes[activeTrailCount] = spk.size * (1.0 - lifeNorm * 0.4);
        trailAlphas[activeTrailCount] = alpha;

        activeTrailCount++;
      }

      if (trailGeomRef.current) {
        trailGeomRef.current.setDrawRange(0, activeTrailCount);
        trailGeomRef.current.attributes.position.needsUpdate = true;
        trailGeomRef.current.attributes.color.needsUpdate = true;
        trailGeomRef.current.attributes.size.needsUpdate = true;
        trailGeomRef.current.attributes.alpha.needsUpdate = true;
      }

      if (trailMeshRef.current) {
        trailMeshRef.current.visible = activeTrailCount > 0;
      }

      if (currentState === "READY") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = false;
        }
        if (rocketMeshRef.current) {
          rocketMeshRef.current.visible = false;
        }
      } else if (currentState === "ROCKET_LAUNCH") {
        // Points MUST stay hidden during rocket flight so no blob appears
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = false;
        }
        if (rocketMeshRef.current) {
          rocketMeshRef.current.visible = true;
          // Ascend from bottom (-3.8) to apex center (0.5) over 1.15s with ballistic deceleration
          const launchDur = 1.15;
          const progress = Math.min(elapsedInState / launchDur, 1.0);
          const easeY = -3.8 + 4.3 * (1.0 - Math.pow(1.0 - progress, 1.8));
          rocketMeshRef.current.position.y = easeY;
          rocketMeshRef.current.position.x = Math.sin(progress * 4.0) * 0.03;

          // Rocket tracer light streak subtle shimmer
          if (tracerMesh) {
            tracerMesh.scale.y = 0.9 + Math.random() * 0.2;
          }

          if (progress >= 1.0) {
            // Rocket reached apex -> Detonate directly into Rangoli geometry!
            rocketMeshRef.current.visible = false;
            if (pointsMeshRef.current) {
              pointsMeshRef.current.visible = true;
            }
            playSound("explosion");
            setState("BLAST_EXPANSION");
            stateStartTimeRef.current = performance.now();
          }
        }
      } else if (currentState === "BLAST_EXPANSION") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = true;
        }
        const blastDur = 0.85;
        const blastProgress = Math.min(elapsedInState / blastDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uBlastProgress.value = blastProgress;
          materialRef.current.uniforms.uExplosionProgress.value = blastProgress;
          materialRef.current.uniforms.uMorphProgress.value = blastProgress;
          materialRef.current.uniforms.uFallProgress.value = 0.0;
          materialRef.current.uniforms.uDissolveProgress.value = 0.0;
        }

        if (elapsedInState >= blastDur) {
          if (mode === "rangoli") {
            setState("BURST_HOLD");
          } else {
            setState("PORTRAIT_IDLE");
            setIsProcessing(false);
          }
          stateStartTimeRef.current = performance.now();
        }
      } else if (currentState === "BURST_HOLD") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = true;
        }
        // Sparks stay crystallized in Rangoli geometry for 2 to 3 seconds
        const holdDur = 2.8;
        if (materialRef.current) {
          materialRef.current.uniforms.uBlastProgress.value = 1.0;
          materialRef.current.uniforms.uExplosionProgress.value = 1.0;
          materialRef.current.uniforms.uMorphProgress.value = 1.0;
          materialRef.current.uniforms.uFallProgress.value = 0.0;
          materialRef.current.uniforms.uDissolveProgress.value = 0.0;
        }

        if (elapsedInState >= holdDur) {
          setState("GRAVITY_FALL");
          stateStartTimeRef.current = performance.now();
        }
      } else if (currentState === "GRAVITY_FALL") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = true;
        }
        // Embers cascade downward under gravity and dissolve into the night sky
        const fallDur = 2.2;
        const fallProgress = Math.min(elapsedInState / fallDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uBlastProgress.value = 1.0;
          materialRef.current.uniforms.uExplosionProgress.value = 1.0;
          materialRef.current.uniforms.uMorphProgress.value = 1.0;
          materialRef.current.uniforms.uFallProgress.value = fallProgress;
          materialRef.current.uniforms.uDissolveProgress.value = 0.0;
        }

        if (elapsedInState >= fallDur) {
          setState("IDLE_COMPLETE");
          if (pointsMeshRef.current) {
            pointsMeshRef.current.visible = false;
          }
          setIsProcessing(false);
          stateStartTimeRef.current = performance.now();
        }
      } else if (currentState === "IDLE_COMPLETE") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = false;
        }
        if (rocketMeshRef.current) {
          rocketMeshRef.current.visible = false;
        }
      } else if (currentState === "PORTRAIT_IDLE") {
        if (pointsMeshRef.current) {
          pointsMeshRef.current.visible = true;
        }
        if (materialRef.current) {
          materialRef.current.uniforms.uBlastProgress.value = 1.0;
          materialRef.current.uniforms.uExplosionProgress.value = 1.0;
          materialRef.current.uniforms.uMorphProgress.value = 1.0;
          materialRef.current.uniforms.uFallProgress.value = 0.0;
          materialRef.current.uniforms.uDissolveProgress.value = 0.0;
        }
      } else if (currentState === "PARTICLE_DISSOLVE") {
        // Dissolve outward smoothly over 0.65s
        const dissolveDur = 0.65;
        const progress = Math.min(elapsedInState / dissolveDur, 1.0);
        if (materialRef.current) {
          materialRef.current.uniforms.uDissolveProgress.value = progress;
        }

        if (progress >= 1.0) {
          if (pointsMeshRef.current) {
            pointsMeshRef.current.visible = false;
          }
          // Advance to targeted or next photo and trigger rocket launch
          const nextIdx =
            targetPhotoIndexRef.current !== null
              ? targetPhotoIndexRef.current
              : (currentPhotoIndex + 1) % photos.length;
          targetPhotoIndexRef.current = null;
          setCurrentPhotoIndex(nextIdx);
          loadPhotoToGeometry(photos[nextIdx].url).then(() => {
            triggerLaunch();
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
      tracerGeom.dispose();
      tracerMat.dispose();
      tipSparkGeom.dispose();
      tipSparkMat.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
    };
  }, [photos, loadPhotoToGeometry]);

  // Trigger launch helper
  const triggerLaunch = () => {
    setState("ROCKET_LAUNCH");
    stateStartTimeRef.current = performance.now();
    playSound("rocket");

    // Clear and reset trailing sparks
    trailSparksRef.current = [];
    if (trailGeomRef.current) {
      trailGeomRef.current.setDrawRange(0, 0);
    }
    if (trailMeshRef.current) {
      trailMeshRef.current.visible = false;
    }

    if (pointsMeshRef.current) {
      pointsMeshRef.current.visible = false;
    }
    if (rocketMeshRef.current) {
      rocketMeshRef.current.visible = true;
      rocketMeshRef.current.position.set(0, -3.8, 0);
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uBlastProgress.value = 0.0;
      materialRef.current.uniforms.uExplosionProgress.value = 0.0;
      materialRef.current.uniforms.uMorphProgress.value = 0.0;
      materialRef.current.uniforms.uFallProgress.value = 0.0;
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
    if (isLoadingImage || targetIdx < 0 || targetIdx >= photos.length) return;
    if (stateRef.current === "ROCKET_LAUNCH") return;

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
                  disabled={isLoadingImage || state === "ROCKET_LAUNCH"}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-diwali-gold text-diwali-night hover:scale-105 active:scale-95 transition-all shadow-glow-gold disabled:opacity-50"
                  title="Re-launch cracker rocket into active Rangoli"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${state === "ROCKET_LAUNCH" ? "animate-spin" : ""}`} />
                  <span>{state === "ROCKET_LAUNCH" ? "Ascending..." : "Replay Blast"}</span>
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
                      {currentPhotoIndex === idx
                        ? state === "ROCKET_LAUNCH"
                          ? "Ascending..."
                          : state === "BLAST_EXPANSION"
                          ? "Detonating..."
                          : state === "BURST_HOLD"
                          ? "Glowing Sacred Art"
                          : state === "GRAVITY_FALL"
                          ? "Cascading Embers..."
                          : "Active Burst"
                        : "Tap to Fire"}
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
