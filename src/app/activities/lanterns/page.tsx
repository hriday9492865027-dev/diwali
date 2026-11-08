"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

interface ReleasedLantern {
  id: number;
  text: string;
  leftPercent: number;
  speed: number;
  delay?: number;
}

export default function LanternsActivityPage() {
  const [wish, setWish] = useState("");
  const [lanterns, setLanterns] = useState<ReleasedLantern[]>([]);

  // Ambient starter lanterns already ascending into the heavens
  useEffect(() => {
    const starterLanterns: ReleasedLantern[] = [
      {
        id: 1,
        text: "Peace & Auspicious Light",
        leftPercent: 18,
        speed: 18,
        delay: -4,
      },
      {
        id: 2,
        text: "Health & Joyful Prosperity",
        leftPercent: 78,
        speed: 19,
        delay: -9,
      },
      {
        id: 3,
        text: "Love, Warmth & Family",
        leftPercent: 48,
        speed: 21,
        delay: -14,
      },
    ];
    setLanterns(starterLanterns);
  }, []);

  // Gentle pentatonic chime on lantern release
  const playReleaseChime = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      [587.33, 739.99, 880.0, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.08, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 2.0);
      });
    } catch {
      // Best-effort audio
    }
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWish = wish.trim();
    if (!cleanWish) return;

    playReleaseChime();

    const newLantern: ReleasedLantern = {
      id: Date.now(),
      text: cleanWish,
      leftPercent: 15 + Math.random() * 70, // Keep within readable viewport width
      speed: 16 + Math.random() * 6, // 16s - 22s slow, peaceful ascent
      delay: 0,
    };

    setLanterns((prev) => [...prev, newLantern]);
    setWish("");
  };

  const removeLantern = (id: number) => {
    setLanterns((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 flex flex-col justify-between overflow-hidden select-none">
      <AmbientParticles />

      {/* Top Header */}
      <header className="relative z-20 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-diwali-gold/15">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold tracking-[0.18em] text-gold-gradient uppercase">
            Virtual Sky Lanterns
          </h1>
          <p className="text-[11px] text-diwali-muted">Release Wishes into the Night Sky</p>
        </div>

        <div className="w-16" />
      </header>

      {/* Floating Animated Lanterns Layer (Ascends from bottom past top edge) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {lanterns.map((l) => (
          <div
            key={l.id}
            onAnimationEnd={() => removeLantern(l.id)}
            className="absolute bottom-0 flex flex-col items-center"
            style={{
              left: `${l.leftPercent}%`,
              animation: `lanternAscend ${l.speed}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
              animationDelay: l.delay ? `${l.delay}s` : "0s",
              willChange: "transform, opacity",
            }}
          >
            {/* Glowing Lantern SVG */}
            <div className="w-16 h-20 md:w-22 md:h-26 relative flex items-center justify-center filter drop-shadow-[0_0_25px_rgba(245,158,11,0.85)]">
              <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
                <defs>
                  <radialGradient id={`lanternLight-${l.id}`} cx="50%" cy="60%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#fef08a" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#ea580c" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.4" />
                  </radialGradient>
                  <filter id={`glow-${l.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Soft outer aura */}
                <circle cx="40" cy="55" r="32" fill="#f59e0b" opacity="0.25" filter={`url(#glow-${l.id})`} />

                {/* Rice Paper Lantern Envelope */}
                <path
                  d="M 20 15 Q 10 50 16 85 Q 40 92 64 85 Q 70 50 60 15 Q 40 10 20 15 Z"
                  fill={`url(#lanternLight-${l.id})`}
                  stroke="#f5c042"
                  strokeWidth="1.5"
                />

                {/* Internal Bamboo Ribs */}
                <path d="M 18 35 Q 40 38 62 35" stroke="rgba(245, 192, 66, 0.3)" strokeWidth="0.8" fill="none" />
                <path d="M 16 55 Q 40 60 64 55" stroke="rgba(245, 192, 66, 0.3)" strokeWidth="0.8" fill="none" />
                <path d="M 16 72 Q 40 76 64 72" stroke="rgba(245, 192, 66, 0.3)" strokeWidth="0.8" fill="none" />

                {/* Flame Core */}
                <ellipse cx="40" cy="72" rx="4.5" ry="7" fill="#ffffff" filter="drop-shadow(0 0 8px #fff)" />
              </svg>
            </div>

            {/* Wish Inscription Plaque */}
            <span className="text-[10px] text-diwali-gold font-light tracking-wide bg-black/75 px-3 py-0.5 rounded-full border border-diwali-gold/40 mt-1 max-w-[170px] truncate shadow-lg backdrop-blur-sm">
              ✨ {l.text}
            </span>
          </div>
        ))}
      </div>

      {/* Center Input Form */}
      <div className="relative z-20 max-w-md mx-auto w-full my-auto py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
          <Send className="w-6 h-6 text-diwali-gold" />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gold-gradient uppercase mb-2">
          Inscribe Your Wish
        </h2>
        <p className="text-xs text-diwali-muted mb-6 leading-relaxed">
          Write a secret wish or blessing for the coming year. Release it to join thousands of lights drifting into the heavens.
        </p>

        <form onSubmit={handleRelease} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              maxLength={80}
              required
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="e.g. May joy, health, and peace fill our home..."
              className="w-full px-5 py-3.5 bg-black/60 border border-diwali-border rounded-2xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold focus:ring-1 focus:ring-diwali-gold backdrop-blur-md transition-colors"
            />
          </div>

          <DiwaliButton type="submit" size="md" className="w-full">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Release Sky Lantern</span>
            </span>
          </DiwaliButton>
        </form>
      </div>

      {/* Footer */}
      <footer className="relative z-20 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May every wish you send into the night sky find its way to fulfillment.
      </footer>
    </main>
  );
}
