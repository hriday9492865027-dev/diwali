"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Download,
  Trash2,
  Undo2,
  Redo2,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  X,
} from "lucide-react";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import { GlassCard } from "@/components/ui/GlassCard";

const PALETTE_COLORS = [
  { name: "Surya Gold", hex: "#f5c042" },
  { name: "Kesar Saffron", hex: "#f97316" },
  { name: "Kumkum Vermillion", hex: "#e11d48" },
  { name: "Gulabi Pink", hex: "#ec4899" },
  { name: "Haldi Yellow", hex: "#eab308" },
  { name: "Mehendi Green", hex: "#10b981" },
  { name: "Mayur Cyan", hex: "#06b6d4" },
  { name: "Amethyst Violet", hex: "#a855f7" },
  { name: "Sacred White", hex: "#ffffff" },
];

const BRUSH_SIZES = [
  { label: "Fine", size: 2 },
  { label: "Medium", size: 4 },
  { label: "Bold", size: 7 },
  { label: "Glow", size: 12 },
];

const SYMMETRIES = [6, 8, 12, 16];

export default function RangoliActivityPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing tools state
  const [selectedColor, setSelectedColor] = useState("#f5c042");
  const [brushSize, setBrushSize] = useState(3);
  const [symmetryCount, setSymmetryCount] = useState(8);
  const [showGuides, setShowGuides] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo & Redo History state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);

  // Unsaved changes confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: "CLEAR" | "NEW" | "DASHBOARD";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: "CLEAR",
  });

  // Initial Canvas Setup (ONLY runs once on mount - never resets on petal count change!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Midnight festive base background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, 600, 600);
  }, []);

  // Browser refresh/close prevention
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved Rangoli artwork. Do you want to download and save it before leaving?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // High-Resolution PNG Artwork Downloader
  const downloadArtwork = (showSuccessToast = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    const size = 1200;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Rich deep night backdrop
    ctx.fillStyle = "#070a1e";
    ctx.fillRect(0, 0, size, size);

    // Decorative outer gold borders
    ctx.strokeStyle = "rgba(245, 192, 66, 0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, size - 60, size - 60);

    ctx.strokeStyle = "rgba(245, 192, 66, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(44, 44, size - 88, size - 88);

    // Corner diamond accents
    const drawDiamond = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = "rgba(245, 192, 66, 0.7)";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawDiamond(44, 44);
    drawDiamond(size - 44, 44);
    drawDiamond(44, size - 44);
    drawDiamond(size - 44, size - 44);

    // Draw the actual rangoli drawing centered and scaled crisp
    ctx.drawImage(canvas, 70, 70, size - 140, size - 140);

    // Sacred Deepavali typography
    ctx.font = "bold 22px 'Cinzel', Georgia, serif";
    ctx.fillStyle = "rgba(245, 192, 66, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText("SHUBH DEEPAVALI — SACRED RANGOLI", size / 2, size - 52);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.fillText("Created with Sacred Symmetry & Light", size / 2, size - 28);

    // Trigger download
    const dataUrl = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `deepavali-rangoli-art-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setHasUnsavedChanges(false);
    if (showSuccessToast) {
      setToast("Rangoli artwork downloaded and saved to your device!");
      setTimeout(() => setToast(null), 4000);
    }
  };

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
    ctx.shadowBlur = brushSize * 2.2;
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
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Snapshot state for undo
    if (undoStackRef.current.length >= 30) {
      undoStackRef.current.shift();
    }
    undoStackRef.current.push(ctx.getImageData(0, 0, 600, 600));
    setCanUndo(true);

    // Any new stroke clears the redo stack
    redoStackRef.current = [];
    setCanRedo(false);

    setHasUnsavedChanges(true);

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

  // Undo action
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (undoStackRef.current.length === 0) return;

    // Push current canvas state to redo stack
    if (redoStackRef.current.length >= 30) {
      redoStackRef.current.shift();
    }
    redoStackRef.current.push(ctx.getImageData(0, 0, 600, 600));
    setCanRedo(true);

    // Pop and apply previous state from undo stack
    const previousState = undoStackRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }

    setCanUndo(undoStackRef.current.length > 0);
    if (undoStackRef.current.length === 0) {
      setHasUnsavedChanges(false);
    }
  };

  // Redo action
  const handleRedo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (redoStackRef.current.length === 0) return;

    // Push current state to undo stack
    if (undoStackRef.current.length >= 30) {
      undoStackRef.current.shift();
    }
    undoStackRef.current.push(ctx.getImageData(0, 0, 600, 600));
    setCanUndo(true);

    // Pop and apply next state from redo stack
    const nextState = redoStackRef.current.pop();
    if (nextState) {
      ctx.putImageData(nextState, 0, 0);
    }

    setCanRedo(redoStackRef.current.length > 0);
    setHasUnsavedChanges(true);
  };

  const executeClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, 600, 600);

    undoStackRef.current = [];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
    setHasUnsavedChanges(false);
  };

  // Intercept clearing canvas
  const requestClear = () => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: "Save Rangoli Before Clearing?",
        description:
          "You have an unsaved sacred Rangoli artwork on canvas. Would you like to download and save it before clearing?",
        action: "CLEAR",
      });
    } else {
      executeClear();
    }
  };

  // Intercept creating new artwork
  const requestNew = () => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: "Save Rangoli Before Starting New?",
        description:
          "Would you like to download and save your current Rangoli artwork before starting a fresh creation?",
        action: "NEW",
      });
    } else {
      executeClear();
      setToast("Fresh Rangoli canvas ready!");
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Intercept dashboard navigation
  const requestDashboard = () => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: "Save Rangoli Before Leaving?",
        description:
          "You have an unsaved Rangoli artwork in progress. Would you like to download it to your device before returning to the dashboard?",
        action: "DASHBOARD",
      });
    } else {
      router.push("/dashboard");
    }
  };

  // Confirm dialog actions
  const handleConfirmSaveAndProceed = () => {
    downloadArtwork(false);
    const act = confirmDialog.action;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (act === "CLEAR") {
      executeClear();
      setToast("Artwork saved & canvas cleared!");
    } else if (act === "NEW") {
      executeClear();
      setToast("Artwork saved & new canvas ready!");
    } else if (act === "DASHBOARD") {
      router.push("/dashboard");
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleConfirmDiscard = () => {
    const act = confirmDialog.action;
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    if (act === "CLEAR" || act === "NEW") {
      executeClear();
      setToast(act === "CLEAR" ? "Canvas cleared." : "Fresh canvas ready.");
    } else if (act === "DASHBOARD") {
      router.push("/dashboard");
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 flex flex-col justify-between overflow-hidden select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-diwali-gold/90 text-diwali-night font-bold text-xs tracking-wider shadow-glow-gold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Confirmation Modal for Save / Discard / Cancel */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <GlassCard glow className="max-w-md w-full p-6 space-y-5 text-center relative border-diwali-gold/40 shadow-glow-gold-lg">
            <button
              onClick={handleCancelDialog}
              className="absolute top-4 right-4 p-1.5 rounded-full text-diwali-muted hover:text-diwali-gold hover:bg-white/10 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-diwali-gold/15 border border-diwali-gold/40 text-diwali-gold flex items-center justify-center mx-auto shadow-glow-gold">
              <Download className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-diwali-gold uppercase tracking-wider">
                {confirmDialog.title}
              </h2>
              <p className="text-xs text-diwali-muted leading-relaxed">
                {confirmDialog.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <DiwaliButton
                onClick={handleConfirmSaveAndProceed}
                size="sm"
                className="w-full sm:w-auto"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Save & Download Art</span>
                </span>
              </DiwaliButton>

              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Discard Art</span>
              </button>

              <button
                type="button"
                onClick={handleCancelDialog}
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 text-diwali-muted hover:text-diwali-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-diwali-gold/15 gap-2">
        <button
          type="button"
          onClick={requestDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold hover:border-diwali-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="text-center">
          <h1 className="text-base md:text-xl font-bold tracking-[0.18em] text-gold-gradient uppercase">
            Sacred Rangoli Creator
          </h1>
          <p className="text-[10px] md:text-[11px] text-diwali-muted">
            Sacred Symmetrical Sand Art & Auspicious Mandala
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download / Save Button */}
          <button
            type="button"
            onClick={() => downloadArtwork(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-diwali-gold text-diwali-night font-bold text-xs uppercase tracking-wider shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
            title="Download Rangoli as high-resolution PNG image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Art</span>
          </button>

          {/* New Canvas Button */}
          <button
            type="button"
            onClick={requestNew}
            className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-gold hover:bg-diwali-gold/20 transition-colors"
            title="Create New Rangoli Art"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={requestClear}
            className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-red-400 hover:border-red-400/50 transition-colors"
            title="Clear canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas & Toolbox */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center my-auto py-2">
        {/* Controls Toolbar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded-2xl bg-black/50 border border-diwali-gold/30 backdrop-blur-md">
          {/* Color Palette */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  selectedColor === c.hex
                    ? "scale-125 border-white shadow-glow-gold z-10"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Brush Sizes */}
            <div className="flex items-center gap-1 text-[11px] text-diwali-muted font-semibold">
              <span className="mr-1">Brush:</span>
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  onClick={() => setBrushSize(b.size)}
                  className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                    brushSize === b.size
                      ? "border-diwali-gold text-diwali-gold bg-diwali-gold/20 font-bold"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                  title={`${b.label} (${b.size}px)`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            {/* Symmetry Controls (Petals) - Never resets existing art! */}
            <div className="flex items-center gap-1 text-[11px] text-diwali-muted font-semibold">
              <span className="mr-1">Petals:</span>
              {SYMMETRIES.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setSymmetryCount(sym)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-colors ${
                    symmetryCount === sym
                      ? "border-diwali-gold text-diwali-gold bg-diwali-gold/20 font-bold scale-110"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                  title={`Switch to ${sym}-fold symmetry for subsequent strokes`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            {/* Undo & Redo Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-lg border border-white/15 text-xs text-diwali-muted hover:text-diwali-gold hover:border-diwali-gold disabled:opacity-25 disabled:pointer-events-none transition-colors"
                title="Undo last stroke"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-lg border border-white/15 text-xs text-diwali-muted hover:text-diwali-gold hover:border-diwali-gold disabled:opacity-25 disabled:pointer-events-none transition-colors"
                title="Redo stroke"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Guidelines */}
            <button
              type="button"
              onClick={() => setShowGuides(!showGuides)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showGuides
                  ? "border-diwali-gold/40 text-diwali-gold bg-diwali-gold/10"
                  : "border-white/15 text-diwali-muted hover:text-white"
              }`}
              title={showGuides ? "Hide symmetry guidelines" : "Show symmetry guidelines"}
            >
              {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Drawing Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-diwali-gold/40 shadow-glow-gold bg-[#0a0e27]">
          {/* User Drawing Canvas (Never cleared on petal count or guide toggle) */}
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

          {/* Symmetrical Guidelines SVG Overlay (Pointer-events-none, reactive to petal count) */}
          {showGuides && (
            <svg
              viewBox="0 0 600 600"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Concentric Guide Circles */}
              {[60, 120, 180, 240, 280].map((r) => (
                <circle
                  key={r}
                  cx="300"
                  cy="300"
                  r={r}
                  fill="none"
                  stroke="rgba(245, 192, 66, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Radial Spokes based on active symmetryCount */}
              {Array.from({ length: symmetryCount }).map((_, i) => {
                const angle = (i * Math.PI * 2) / symmetryCount;
                const x2 = 300 + Math.cos(angle) * 285;
                const y2 = 300 + Math.sin(angle) * 285;
                return (
                  <line
                    key={i}
                    x1="300"
                    y1="300"
                    x2={x2}
                    y2={y2}
                    stroke="rgba(245, 192, 66, 0.14)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Center Sacred Bindu */}
              <circle cx="300" cy="300" r="4" fill="rgba(245, 192, 66, 0.5)" />
            </svg>
          )}
        </div>

        <div className="flex items-center justify-between w-full max-w-[520px] text-[11px] text-diwali-muted/80 tracking-wider mt-2.5 px-1">
          <span>✨ Draw with mouse or touch. Radiating in {symmetryCount}-fold symmetry.</span>
          {hasUnsavedChanges && (
            <span className="text-amber-300 font-medium animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Unsaved Art</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-3 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May your creativity bring sacred auspiciousness and prosperity to your festive celebration.
      </footer>
    </main>
  );
}
