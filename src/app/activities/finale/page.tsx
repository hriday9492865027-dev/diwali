"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, RotateCcw, Home } from "lucide-react";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import confetti from "canvas-confetti";

export default function GrandFinaleActivityPage() {
  const [studentName, setStudentName] = useState("Cherished Guest");
  const [fireworksCount, setFireworksCount] = useState(0);

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.displayName) setStudentName(data.displayName);
      })
      .catch(() => {});

    triggerGrandFireworks();
  }, []);

  const triggerGrandFireworks = () => {
    setFireworksCount((prev) => prev + 1);

    const duration = 4000;
    const end = Date.now() + duration;

    const colors = ["#f5c042", "#ea580c", "#f97316", "#fef08a", "#b91c1c", "#10b981", "#8b5cf6"];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 70,
        origin: { x: 0.15, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 70,
        origin: { x: 0.85, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 8,
        spread: 120,
        origin: { x: 0.5, y: 0.4 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
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
            Grand Finale
          </h1>
          <p className="text-[11px] text-diwali-muted">Festival Celebration Spectacle</p>
        </div>

        <button
          onClick={triggerGrandFireworks}
          className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-diwali-gold transition-colors"
          title="Replay fireworks"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Center Spectacle Presentation */}
      <div className="relative z-10 max-w-2xl mx-auto w-full my-auto py-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 text-xs tracking-[0.25em] uppercase text-diwali-gold font-semibold mb-6 shadow-glow-gold">
          <Sparkles className="w-4 h-4 text-diwali-gold animate-pulse" />
          <span>Celebration Climax</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-[0.15em] text-gold-gradient uppercase drop-shadow-[0_4px_30px_rgba(245,192,66,0.4)] mb-4">
          SHUBH DEEPAVALI
        </h2>

        <div className="my-2">
          <span className="text-xs uppercase tracking-[0.25em] text-diwali-muted block mb-1">
            Wishing Continuous Brilliance & Light To
          </span>
          <h3 className="text-3xl md:text-5xl font-bold tracking-wide text-fire-gradient">
            {studentName}
          </h3>
        </div>

        <p className="text-sm md:text-base text-diwali-ivory/80 font-light leading-relaxed my-6 max-w-lg mx-auto">
          As the fireworks illuminate the skies, may your life be forever brightened with good health, unyielding joy, cherished memories, and abundant success.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <DiwaliButton size="lg" onClick={triggerGrandFireworks} className="min-w-[200px]">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Replay Fireworks</span>
            </span>
          </DiwaliButton>

          <Link href="/dashboard">
            <DiwaliButton size="lg" variant="secondary" className="min-w-[180px]">
              <span className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Return to Hub</span>
              </span>
            </DiwaliButton>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        Thank you for being part of this celebration. Keep shining bright!
      </footer>
    </main>
  );
}

