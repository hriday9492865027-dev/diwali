"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ParticlePortraitEngine } from "@/components/portrait/ParticlePortraitEngine";
import { PhotoAsset } from "@/lib/particles/types";
import { Sparkles, ArrowLeft, Paintbrush } from "lucide-react";
import Link from "next/link";

/**
 * Procedural Starter Presets for Sacred Rangoli:
 * Ensures the fireworks gallery is rich and stunning even before the user draws one.
 */
function generateDefaultRangolis(): PhotoAsset[] {
  if (typeof window === "undefined") return [];

  const createPreset = (
    id: string,
    caption: string,
    painter: (ctx: CanvasRenderingContext2D, size: number) => void
  ): PhotoAsset => {
    const size = 600;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { id, url: "", caption };

    // Midnight festive background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, size, size);

    painter(ctx, size);

    return {
      id,
      url: canvas.toDataURL("image/png"),
      caption,
      createdAt: Date.now(),
    };
  };

  // 1. Surya Lotus Mandala
  const lotus = createPreset("preset_lotus", "Surya Lotus Mandala", (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const petals = 12;

    ctx.strokeStyle = "#f5c042";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 215, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 195, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.strokeStyle = "#f5c042";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.quadraticCurveTo(55, 120, 0, 185);
      ctx.quadraticCurveTo(-55, 120, 0, 40);
      ctx.stroke();

      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.quadraticCurveTo(28, 105, 0, 150);
      ctx.quadraticCurveTo(-28, 105, 0, 50);
      ctx.stroke();

      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.arc(0, 110, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.fillStyle = "#f5c042";
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Cosmic Star Chakra
  const chakra = createPreset("preset_chakra", "Cosmic Star Chakra", (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const points = 16;

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 3;
    for (let i = 0; i < points; i++) {
      const a = (i * Math.PI * 2) / points;
      const px = cx + Math.cos(a) * 215;
      const py = cy + Math.sin(a) * 215;
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let layer = 0; layer < 2; layer++) {
      ctx.strokeStyle = layer === 0 ? "#f5c042" : "#e11d48";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const a = (i * Math.PI * 2) / points + (layer * Math.PI) / points;
        const r = i % 2 === 0 ? 190 : 80;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f5c042";
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Mayur Emerald Radiance
  const mayur = createPreset("preset_mayur", "Mayur Emerald Radiance", (ctx, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const spokes = 8;

    for (let i = 0; i < spokes; i++) {
      const angle = (i * Math.PI * 2) / spokes;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 130, 65, -0.6, Math.PI + 0.6);
      ctx.stroke();

      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 135, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.arc(0, 135, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f5c042";
      ctx.beginPath();
      ctx.arc(0, 135, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.strokeStyle = "#f5c042";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
  });

  return [lotus, chakra, mayur];
}

function RangoliFireworksContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const [rangolis, setRangolis] = useState<PhotoAsset[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved Rangolis from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("deepavali_saved_rangolis");
      let list: PhotoAsset[] = [];
      if (raw) {
        list = JSON.parse(raw);
      }

      // If empty, generate and store default presets
      if (!list || list.length === 0) {
        list = generateDefaultRangolis();
        try {
          localStorage.setItem("deepavali_saved_rangolis", JSON.stringify(list));
        } catch {
          // ignore quota issues
        }
      }

      setRangolis(list);

      // Determine starting photo
      const activeId = targetId || localStorage.getItem("deepavali_active_rangoli_id");
      if (activeId) {
        const foundIdx = list.findIndex((item) => item.id === activeId);
        if (foundIdx >= 0) {
          setActiveIndex(foundIdx);
        }
      }
    } catch (err) {
      console.error("Failed to load saved rangolis:", err);
      const defaults = generateDefaultRangolis();
      setRangolis(defaults);
    } finally {
      setIsLoaded(true);
    }
  }, [targetId]);

  // Handle Deleting a Saved Rangoli
  const handleDeleteRangoli = (id: string) => {
    const updated = rangolis.filter((item) => item.id !== id);
    const finalList = updated.length > 0 ? updated : generateDefaultRangolis();

    setRangolis(finalList);
    try {
      localStorage.setItem("deepavali_saved_rangolis", JSON.stringify(finalList));
    } catch {
      // ignore
    }

    if (activeIndex >= finalList.length) {
      setActiveIndex(0);
    }
  };

  const handleSelectRangoli = (index: number) => {
    setActiveIndex(index);
    if (rangolis[index]) {
      try {
        localStorage.setItem("deepavali_active_rangoli_id", rangolis[index].id);
      } catch {
        // ignore
      }
    }
  };

  if (!isLoaded || rangolis.length === 0) {
    return (
      <main className="min-h-screen w-full bg-diwali-night flex flex-col items-center justify-center text-diwali-gold p-4">
        <Sparkles className="w-8 h-8 animate-spin text-diwali-gold mb-3" />
        <p className="text-sm font-semibold tracking-wider">Preparing Rangoli Fireworks Engine...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory overflow-y-auto overflow-x-hidden select-none">
      {/* Top Auspicious Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 backdrop-blur-md text-[11px] text-diwali-gold font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Firecracker Stencil of Sacred Geometry</span>
        </div>
      </div>

      {/* Shared WebGL2 Particle Fireworks Engine running in rangoli mode */}
      <ParticlePortraitEngine
        photos={rangolis}
        initialIndex={activeIndex}
        mode="rangoli"
        title="Celestial Rangoli Fireworks"
        subtitle="Firecrackers detonate into the sacred geometry and vivid pigments of your Rangoli"
        backHref="/activities/rangoli"
        backLabel="Rangoli Studio"
        autoLaunch={true}
        onSelectPhoto={handleSelectRangoli}
        onDeletePhoto={handleDeleteRangoli}
      />
    </main>
  );
}

export default function RangoliFireworksPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full bg-diwali-night flex flex-col items-center justify-center text-diwali-gold p-4">
          <Sparkles className="w-8 h-8 animate-spin text-diwali-gold mb-3" />
          <p className="text-sm font-semibold tracking-wider">Loading Fireworks Arena...</p>
        </main>
      }
    >
      <RangoliFireworksContent />
    </Suspense>
  );
}
