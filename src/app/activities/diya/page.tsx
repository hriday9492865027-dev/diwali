"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

interface DiyaState {
  id: number;
  isLit: boolean;
  name: string;
  blessing: string;
}

export default function DiyaActivityPage() {
  const [diyas, setDiyas] = useState<DiyaState[]>([
    { id: 1, isLit: true, name: "Diya of Wisdom", blessing: "May knowledge dispel all shadows of doubt." },
    { id: 2, isLit: false, name: "Diya of Prosperity", blessing: "May abundance and success bless every step you take." },
    { id: 3, isLit: false, name: "Diya of Peace", blessing: "May serenity and calm grace your mind and home." },
    { id: 4, isLit: false, name: "Diya of Love", blessing: "May shared joy and sweet bonds flourish around you." },
    { id: 5, isLit: false, name: "Diya of Health", blessing: "May vitality and radiant well-being empower you." },
  ]);

  const [activeBlessing, setActiveBlessing] = useState<string>(
    "Tap any unlit diya to kindle its sacred flame and receive its blessing."
  );

  const toggleDiya = (id: number) => {
    setDiyas((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newState = !d.isLit;
          if (newState) {
            setActiveBlessing(d.blessing);
          }
          return { ...d, isLit: newState };
        }
        return d;
      })
    );
  };

  const lightAll = () => {
    setDiyas((prev) => prev.map((d) => ({ ...d, isLit: true })));
    setActiveBlessing("Every lamp is kindled! May your world be filled with unending brilliance and festive warmth.");
  };

  const resetAll = () => {
    setDiyas((prev) => prev.map((d, i) => ({ ...d, isLit: i === 0 })));
    setActiveBlessing("Kindle the earthen lamps to spread sacred light.");
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 flex flex-col justify-between overflow-hidden select-none">
      <AmbientParticles />

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
            Light a Diya
          </h1>
          <p className="text-[11px] text-diwali-muted">Sacred Lamps of Illumination</p>
        </div>

        <button
          onClick={resetAll}
          className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-diwali-gold transition-colors"
          title="Reset lamps"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Center Interactive Diya Row */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center my-auto py-8">
        {/* Dynamic Blessing Message Card */}
        <div className="mb-12 text-center max-w-lg px-6 py-4 rounded-2xl bg-black/50 border border-diwali-gold/30 backdrop-blur-md shadow-glow-gold animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-diwali-gold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Divine Blessing</span>
          </div>
          <p className="text-sm md:text-base text-diwali-ivory font-light italic leading-relaxed">
            "{activeBlessing}"
          </p>
        </div>

        {/* Diyas Arrangement */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {diyas.map((d) => (
            <div
              key={d.id}
              onClick={() => toggleDiya(d.id)}
              className="flex flex-col items-center cursor-pointer group transform transition-transform hover:scale-105"
            >
              {/* Diya SVG Representation */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <svg viewBox="0 0 160 140" className="w-full h-full" fill="none">
                  <defs>
                    <radialGradient id={`flameGlow-${d.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                      <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="80%" stopColor="#ea580c" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="clayBase" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9a3412" />
                      <stop offset="60%" stopColor="#431407" />
                      <stop offset="100%" stopColor="#1e0b04" />
                    </linearGradient>
                  </defs>

                  {/* Flame (Only visible when lit) */}
                  {d.isLit && (
                    <g className="animate-flicker" style={{ transformOrigin: "80px 65px" }}>
                      <circle cx="80" cy="50" r="45" fill={`url(#flameGlow-${d.id})`} />
                      <path
                        d="M 80 18 Q 95 50 88 68 Q 82 76 80 76 Q 78 76 72 68 Q 65 50 80 18 Z"
                        fill="url(#flameGradient)"
                        filter="drop-shadow(0 0 10px #f59e0b)"
                      />
                      <ellipse cx="80" cy="62" rx="3" ry="6" fill="#ffffff" />
                    </g>
                  )}

                  {/* Diya Wick */}
                  <path d="M 80 72 Q 81 77 82 82" stroke="#262626" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Diya Clay Bowl */}
                  <path
                    d="M 28 85 C 34 125 126 125 132 85 C 135 80 125 80 120 81 C 100 86 60 86 40 81 C 35 80 25 80 28 85 Z"
                    fill="url(#clayBase)"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                  />
                  <ellipse cx="80" cy="82" rx="52" ry="9" fill="#290e05" stroke="#f5c042" strokeWidth="1.5" />
                </svg>
              </div>

              <span className="text-xs font-medium text-diwali-gold tracking-wider mt-2 group-hover:text-yellow-200 transition-colors">
                {d.name}
              </span>
              <span className="text-[10px] text-diwali-muted uppercase tracking-widest mt-0.5">
                {d.isLit ? "Kindled" : "Tap to Light"}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button: Light All */}
        <div className="mt-12">
          <DiwaliButton size="md" onClick={lightAll}>
            Kindle All Sacred Diyas
          </DiwaliButton>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May these diyas ignite hope, warmth, and peace in your heart.
      </footer>
    </main>
  );
}
