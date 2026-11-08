"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Palette, Sparkles, Download } from "lucide-react";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

const PALETTE_COLORS = [
  { name: "Gold", hex: "#f5c042" },
  { name: "Saffron", hex: "#ea580c" },
  { name: "Ruby", hex: "#e11d48" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "White", hex: "#ffffff" },
];

export default function RangoliActivityPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState("#f5c042");
  const [brushSize, setBrushSize] = useState(3);
  const [symmetryCount, setSymmetryCount] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw initial center guide dot
    ctx.fillStyle = "#0d1330";
    ctx.fillRect(0, 0, 600, 600);

    ctx.beginPath();
    ctx.arc(300, 300, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 192, 66, 0.4)";
    ctx.fill();
  }, []);

  const drawSymmetrical = (x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = 300;
    const cy = 300;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = brushSize * 2.5;
    ctx.shadowColor = selectedColor;

    const angleStep = (Math.PI * 2) / symmetryCount;

    for (let i = 0; i < symmetryCount; i++) {
      const angle = i * angleStep;

      // Rotate start point
      const rx0 = (x0 - cx) * Math.cos(angle) - (y0 - cy) * Math.sin(angle) + cx;
      const ry0 = (x0 - cx) * Math.sin(angle) + (y0 - cy) * Math.cos(angle) + cy;

      // Rotate end point
      const rx1 = (x1 - cx) * Math.cos(angle) - (y1 - cy) * Math.sin(angle) + cx;
      const ry1 = (x1 - cx) * Math.sin(angle) + (y1 - cy) * Math.cos(angle) + cy;

      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx1, ry1);
      ctx.stroke();

      // Mirror reflection for true symmetrical rangoli
      const mx0 = cx - (rx0 - cx);
      const mx1 = cx - (rx1 - cx);
      ctx.beginPath();
      ctx.moveTo(mx0, ry0);
      ctx.lineTo(mx1, ry1);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 600 / rect.width;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    setIsDrawing(true);
    lastPointRef.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 600 / rect.width;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    drawSymmetrical(lastPointRef.current.x, lastPointRef.current.y, x, y);
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0d1330";
    ctx.fillRect(0, 0, 600, 600);
    ctx.beginPath();
    ctx.arc(300, 300, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 192, 66, 0.4)";
    ctx.fill();
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-diwali-gold/15">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold tracking-[0.18em] text-gold-gradient uppercase">
            Rangoli Creator
          </h1>
          <p className="text-[11px] text-diwali-muted">Sacred Symmetrical Sand Art</p>
        </div>

        <button
          onClick={clearCanvas}
          className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-diwali-gold transition-colors"
          title="Clear canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Canvas & Toolbox */}
      <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center my-auto py-4">
        {/* Color Palette & Brush Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4 p-3 rounded-2xl bg-black/50 border border-diwali-gold/30 backdrop-blur-md">
          {/* Colors */}
          <div className="flex items-center gap-2">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  selectedColor === c.hex ? "scale-125 border-white shadow-glow-gold" : "border-transparent opacity-80"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-white/20 mx-1" />

          {/* Brush Sizes */}
          <div className="flex items-center gap-2 text-xs text-diwali-muted font-semibold">
            <span>Size:</span>
            {[2, 4, 7].map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                  brushSize === s ? "border-diwali-gold text-diwali-gold bg-diwali-gold/15" : "border-white/10 text-white/60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-diwali-gold/40 shadow-glow-gold">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] cursor-crosshair touch-none"
          />
        </div>

        <p className="text-[11px] text-diwali-muted/70 tracking-wider mt-3">
          Draw with mouse or touch. Every stroke mirrors seamlessly in 8-fold sacred symmetry.
        </p>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May your creativity bring sacred auspiciousness to your home.
      </footer>
    </main>
  );
}

