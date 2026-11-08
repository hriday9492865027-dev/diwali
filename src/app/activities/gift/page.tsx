"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Sparkles, RotateCcw } from "lucide-react";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import confetti from "canvas-confetti";

export default function GiftActivityPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [surpriseText, setSurpriseText] = useState(
    "Wishing you infinite joy, cherished moments with loved ones, and the brightest blessings of the festival of lights!"
  );

  useEffect(() => {
    // Fetch student's custom surprise message if authenticated
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.secretMessage) {
          setSurpriseText(data.secretMessage);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenGift = () => {
    if (isOpen) return;

    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
      setIsOpen(true);

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ["#f5c042", "#ea580c", "#f97316", "#fef08a", "#b91c1c"],
      });
    }, 600);
  };

  const handleReset = () => {
    setIsOpen(false);
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
            Surprise Gift Box
          </h1>
          <p className="text-[11px] text-diwali-muted">A Personalized Diwali Blessing</p>
        </div>

        {isOpen ? (
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-diwali-gold transition-colors"
            title="Wrap gift again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* Center Gift Box Presentation */}
      <div className="relative z-10 max-w-xl mx-auto w-full flex flex-col items-center my-auto py-8">
        {!isOpen ? (
          <div className="flex flex-col items-center text-center">
            {/* 3D Festive Gift Box SVG with golden ribbons */}
            <div
              onClick={handleOpenGift}
              className={`relative cursor-pointer transition-transform duration-300 hover:scale-105 ${
                isShaking ? "animate-bounce" : ""
              }`}
            >
              <div className="w-48 h-48 md:w-60 md:h-60 relative flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(245,192,66,0.25)]">
                <svg viewBox="0 0 240 240" className="w-full h-full" fill="none">
                  <defs>
                    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#991b1b" />
                      <stop offset="60%" stopColor="#7f1d1d" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </linearGradient>
                    <linearGradient id="ribbonGold" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f5c042" />
                      <stop offset="50%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>

                  {/* Main Box Base */}
                  <rect x="30" y="80" width="180" height="130" rx="8" fill="url(#boxGrad)" stroke="#f5c042" strokeWidth="1.5" />

                  {/* Vertical Ribbon */}
                  <rect x="105" y="80" width="30" height="130" fill="url(#ribbonGold)" />

                  {/* Box Lid */}
                  <rect x="20" y="60" width="200" height="30" rx="5" fill="#b91c1c" stroke="#f5c042" strokeWidth="1.5" />
                  <rect x="105" y="60" width="30" height="30" fill="url(#ribbonGold)" />

                  {/* Big Ornate Golden Ribbon Bow on Top */}
                  <path
                    d="M 120 60 C 90 20 50 35 70 55 C 85 70 120 60 120 60 Z"
                    fill="url(#ribbonGold)"
                    stroke="#92400e"
                    strokeWidth="1"
                  />
                  <path
                    d="M 120 60 C 150 20 190 35 170 55 C 155 70 120 60 120 60 Z"
                    fill="url(#ribbonGold)"
                    stroke="#92400e"
                    strokeWidth="1"
                  />
                  <circle cx="120" cy="58" r="10" fill="url(#ribbonGold)" />
                </svg>
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-diwali-gold font-semibold mt-6 mb-2">
              A Personal Diwali Surprise Awaits
            </p>
            <p className="text-xs text-diwali-muted max-w-sm mb-6">
              Tap the festive box to unwrap your holiday greeting
            </p>

            <DiwaliButton size="lg" onClick={handleOpenGift} className="min-w-[200px]">
              <span className="inline-flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Unwrap Gift</span>
              </span>
            </DiwaliButton>
          </div>
        ) : (
          /* Opened Gift Box Card */
          <div className="w-full text-center p-8 rounded-3xl bg-black/60 border border-diwali-gold/40 backdrop-blur-xl shadow-glow-gold animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-glow-flame">
              <Sparkles className="w-8 h-8 text-diwali-night" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-diwali-gold block mb-2">
              Diwali Blessings & Surprise
            </span>

            <h2 className="text-xl md:text-2xl font-bold text-gold-gradient uppercase mb-4">
              A Message For You
            </h2>

            <p className="text-sm md:text-base text-diwali-ivory font-light italic leading-relaxed my-6 max-w-md mx-auto">
              "{surpriseText}"
            </p>

            <div className="pt-4 border-t border-diwali-gold/15 flex items-center justify-center gap-4">
              <DiwaliButton size="sm" variant="secondary" onClick={handleReset}>
                Wrap Back Up
              </DiwaliButton>
              <Link href="/dashboard">
                <DiwaliButton size="sm">Return to Hub</DiwaliButton>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May every moment of this festival bring warmth to your heart.
      </footer>
    </main>
  );
}
