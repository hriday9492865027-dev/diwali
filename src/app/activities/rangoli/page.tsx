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
  Maximize2,
  Flame,
  Sparkles,
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

const CANVAS_SIZES = [
  { label: "Standard", dimension: 600, badge: "600px" },
  { label: "Large", dimension: 800, badge: "800px" },
  { label: "Grand Courtyard", dimension: 1000, badge: "1000px" },
];

export default function RangoliActivityPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas Dimension State (dynamically resizable during or before drawing)
  const [canvasDimension, setCanvasDimension] = useState(600);

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

  // Toast notification
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

  // Initial Canvas Setup (ONLY runs once on mount)
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

  /**
   * Seamless Canvas Resizing:
   * Expands the drawing coordinate space (e.g. 600 -> 800 -> 1000px)
   * while keeping ALL EXISTING ARTWORK centered, intact, and perfectly aligned!
   */
  const handleResizeCanvas = (newDimension: number) => {
    if (newDimension === canvasDimension) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      setCanvasDimension(newDimension);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    // 1. Copy current artwork to an offscreen buffer canvas
    const bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = oldWidth;
    bufferCanvas.height = oldHeight;
    const bufferCtx = bufferCanvas.getContext("2d");
    if (bufferCtx) {
      bufferCtx.drawImage(canvas, 0, 0);
    }

    // 2. Migrate undo & redo stacks to new dimensions so undo doesn't shrink the canvas
    const migrateStack = (stack: ImageData[]) => {
      return stack.map((imgData) => {
        const tempC = document.createElement("canvas");
        tempC.width = oldWidth;
        tempC.height = oldHeight;
        const tempCtx = tempC.getContext("2d");
        if (!tempCtx) return imgData;
        tempCtx.putImageData(imgData, 0, 0);

        const resizedC = document.createElement("canvas");
        resizedC.width = newDimension;
        resizedC.height = newDimension;
        const resizedCtx = resizedC.getContext("2d");
        if (!resizedCtx) return imgData;

        resizedCtx.fillStyle = "#0a0e27";
        resizedCtx.fillRect(0, 0, newDimension, newDimension);

        const dx = (newDimension - oldWidth) / 2;
        const dy = (newDimension - oldHeight) / 2;
        resizedCtx.drawImage(tempC, dx, dy);
        return resizedCtx.getImageData(0, 0, newDimension, newDimension);
      });
    };

    undoStackRef.current = migrateStack(undoStackRef.current);
    redoStackRef.current = migrateStack(redoStackRef.current);

    // 3. Update canvas dimensions
    canvas.width = newDimension;
    canvas.height = newDimension;
    setCanvasDimension(newDimension);

    // 4. Fill expanded canvas with background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, newDimension, newDimension);

    // 5. Draw back the preserved artwork perfectly centered
    const offsetX = (newDimension - oldWidth) / 2;
    const offsetY = (newDimension - oldHeight) / 2;
    ctx.drawImage(bufferCanvas, offsetX, offsetY);

    setToast(`Canvas space expanded to ${newDimension}×${newDimension} px (Artwork preserved!)`);
    setTimeout(() => setToast(null), 3500);
  };

  // High-Resolution PNG Artwork Downloader
  const downloadArtwork = (showSuccessToast = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    const size = Math.max(1200, canvas.width);
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

    // Save to local storage gallery as well
    try {
      const raw = localStorage.getItem("deepavali_saved_rangolis");
      const list = raw ? JSON.parse(raw) : [];
      const newId = `rangoli_${Date.now()}`;
      const newArt = {
        id: newId,
        url: canvas.toDataURL("image/png"),
        caption: `Custom Rangoli #${list.length + 1}`,
        createdAt: Date.now(),
      };
      localStorage.setItem("deepavali_saved_rangolis", JSON.stringify([newArt, ...list].slice(0, 15)));
    } catch {
      // Best-effort quota
    }

    setHasUnsavedChanges(false);
    if (showSuccessToast) {
      setToast("Rangoli artwork downloaded and saved to your device & gallery!");
      setTimeout(() => setToast(null), 4000);
    }
  };

  /**
   * Fire The Rangoli:
   * Captures the current Rangoli drawing, stores it to saved gallery,
   * sets it as active, and navigates to the WebGL2 Fireworks screen
   * where rockets ascend and detonate into this exact Rangoli stencil!
   */
  const handleFireTheRangoli = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Capture current canvas artwork
    const dataUrl = canvas.toDataURL("image/png");

    // 2. Read existing saved rangolis from localStorage
    let savedList: any[] = [];
    try {
      const raw = localStorage.getItem("deepavali_saved_rangolis");
      if (raw) savedList = JSON.parse(raw);
    } catch {
      savedList = [];
    }

    const newId = `rangoli_${Date.now()}`;
    const newArt = {
      id: newId,
      url: dataUrl,
      caption: `Custom Rangoli #${savedList.length + 1}`,
      createdAt: Date.now(),
    };

    // Prepend new artwork
    const updated = [newArt, ...savedList.filter((item: any) => item.id !== newId)];
    try {
      localStorage.setItem("deepavali_saved_rangolis", JSON.stringify(updated.slice(0, 15)));
      localStorage.setItem("deepavali_active_rangoli_id", newId);
    } catch (e) {
      console.warn("Storage quota limit reached, saving trimmed list", e);
      localStorage.setItem("deepavali_saved_rangolis", JSON.stringify(updated.slice(0, 8)));
      localStorage.setItem("deepavali_active_rangoli_id", newId);
    }

    setHasUnsavedChanges(false);

    // 3. Navigate to fireworks screen
    router.push(`/activities/rangoli/fireworks?id=${newId}`);
  };

  const drawSymmetrical = (x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

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
    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setCanUndo(true);

    // Any new stroke clears the redo stack
    redoStackRef.current = [];
    setCanRedo(false);

    setHasUnsavedChanges(true);

    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;

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
    const scale = canvas.width / rect.width;

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
    redoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
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
    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          {/* Fire The Rangoli Quick Button */}
          <button
            type="button"
            onClick={handleFireTheRangoli}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-diwali-night font-extrabold text-xs uppercase tracking-wider shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
            title="Launch fireworks that blast into this Rangoli design"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
            <span>Fire Rangoli</span>
          </button>

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
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center my-auto py-2">
        {/* Controls Toolbar */}
        <div className="w-full flex flex-col gap-2.5 mb-3 p-3.5 rounded-2xl bg-black/50 border border-diwali-gold/30 backdrop-blur-md">
          {/* Row 1: Colors & Brushes & Undo/Redo & Guidelines */}
          <div className="flex flex-wrap items-center justify-between gap-3">
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

          {/* Row 2: Dynamic Canvas Space Size Selector & Petals Symmetries */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            {/* Canvas Space Size Selector */}
            <div className="flex items-center gap-1.5 text-[11px] text-diwali-muted font-semibold">
              <span className="mr-1 flex items-center gap-1 text-diwali-gold">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Space Size:</span>
              </span>
              {CANVAS_SIZES.map((sizeOpt) => (
                <button
                  key={sizeOpt.dimension}
                  type="button"
                  onClick={() => handleResizeCanvas(sizeOpt.dimension)}
                  className={`px-2.5 py-1 rounded-full text-[10px] border transition-all ${
                    canvasDimension === sizeOpt.dimension
                      ? "border-diwali-gold text-diwali-gold bg-diwali-gold/20 font-bold shadow-glow-gold scale-105"
                      : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                  }`}
                  title={`Expand canvas to ${sizeOpt.badge} (Existing art is preserved and centered!)`}
                >
                  {sizeOpt.label} ({sizeOpt.badge})
                </button>
              ))}
            </div>

            {/* Symmetry Controls (Petals) */}
            <div className="flex items-center gap-1 text-[11px] text-diwali-muted font-semibold">
              <span className="mr-1 text-diwali-gold">Petals:</span>
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
          </div>
        </div>

        {/* Drawing Canvas Container (Dynamic responsive scaling based on space size) */}
        <div
          className={`relative rounded-3xl overflow-hidden border-2 border-diwali-gold/40 shadow-glow-gold bg-[#0a0e27] w-full transition-all duration-300 aspect-square ${
            canvasDimension === 600
              ? "max-w-[340px] sm:max-w-[480px] md:max-w-[560px]"
              : canvasDimension === 800
              ? "max-w-[360px] sm:max-w-[580px] md:max-w-[700px]"
              : "max-w-[380px] sm:max-w-[660px] md:max-w-[820px]"
          }`}
        >
          {/* User Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none block"
          />

          {/* Symmetrical Guidelines SVG Overlay (Pointer-events-none, reactive to canvas space size and petal count) */}
          {showGuides && (
            <svg
              viewBox={`0 0 ${canvasDimension} ${canvasDimension}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Concentric Guide Circles */}
              {Array.from({ length: 5 }).map((_, idx) => {
                const center = canvasDimension / 2;
                const step = (center - 24) / 5;
                const r = Math.round(step * (idx + 1));
                return (
                  <circle
                    key={r}
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke="rgba(245, 192, 66, 0.12)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Radial Spokes based on active symmetryCount */}
              {Array.from({ length: symmetryCount }).map((_, i) => {
                const center = canvasDimension / 2;
                const radius = center - 20;
                const angle = (i * Math.PI * 2) / symmetryCount;
                const x2 = center + Math.cos(angle) * radius;
                const y2 = center + Math.sin(angle) * radius;
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(245, 192, 66, 0.14)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Center Sacred Bindu */}
              <circle
                cx={canvasDimension / 2}
                cy={canvasDimension / 2}
                r="4.5"
                fill="rgba(245, 192, 66, 0.6)"
              />
            </svg>
          )}
        </div>

        <div className="flex items-center justify-between w-full max-w-[820px] text-[11px] text-diwali-muted/80 tracking-wider mt-2.5 px-2">
          <span>
            ✨ Symmetrical Mandala Space ({canvasDimension}×{canvasDimension}px) • Radiates in {symmetryCount}-fold symmetry.
          </span>
          {hasUnsavedChanges && (
            <span className="text-amber-300 font-medium animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Unsaved Art</span>
            </span>
          )}
        </div>

        {/* Fire The Rangoli Call To Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 w-full max-w-[820px]">
          <button
            type="button"
            onClick={handleFireTheRangoli}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-diwali-night font-extrabold text-xs md:text-sm uppercase tracking-wider shadow-glow-gold-lg hover:scale-105 active:scale-95 transition-all"
            title="Launch fireworks that detonate in the shape and vivid colors of your Rangoli artwork!"
          >
            <Flame className="w-4 h-4 md:w-5 md:h-5 fill-amber-950 text-amber-950" />
            <span>Fire The Rangoli (Fireworks Blast)</span>
          </button>

          <Link
            href="/activities/rangoli/fireworks"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black/50 border border-diwali-gold/40 text-diwali-gold hover:bg-diwali-gold/15 text-xs font-bold uppercase tracking-wider transition-all"
            title="Explore all saved Rangoli artworks and detonate crackers on them"
          >
            <Sparkles className="w-4 h-4 text-diwali-gold" />
            <span>Saved Rangoli Fireworks</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-3 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May your creativity bring sacred auspiciousness and prosperity to your festive celebration.
      </footer>
    </main>
  );
}
