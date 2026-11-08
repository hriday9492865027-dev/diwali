"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Sparkles, RotateCcw } from "lucide-react";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

export default function SecretMessageActivityPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("Cherished Friend");
  const [message, setMessage] = useState(
    "In the glowing light of every diya lies a wish for your happiness. Thank you for bringing warmth, smiles, and kindness into this world. May your year ahead be as luminous and radiant as the Diwali night sky."
  );

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.displayName) setRecipientName(data.displayName);
        if (data.secretMessage) setMessage(data.secretMessage);
      })
      .catch(() => {});
  }, []);

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
            Secret Message
          </h1>
          <p className="text-[11px] text-diwali-muted">Royal Sealed Letter</p>
        </div>

        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-muted hover:text-diwali-gold transition-colors"
            title="Seal envelope"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      {/* Center Envelope Presentation */}
      <div className="relative z-10 max-w-lg mx-auto w-full flex flex-col items-center my-auto py-8">
        {!isOpen ? (
          /* Sealed Envelope */
          <div
            onClick={() => setIsOpen(true)}
            className="w-full flex flex-col items-center cursor-pointer group"
          >
            <div className="relative w-72 h-48 md:w-88 md:h-56 rounded-2xl bg-gradient-to-br from-amber-950/90 to-stone-900 border-2 border-diwali-gold/50 shadow-glow-gold flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
              {/* Envelope Flap Creases */}
              <div className="absolute inset-0 border-b-2 border-diwali-gold/20 pointer-events-none" />

              {/* Royal Golden Wax Seal */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 shadow-glow-flame border-2 border-yellow-200 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <Sparkles className="w-8 h-8 text-diwali-night" />
              </div>

              {/* Envelope Texture Lines */}
              <div className="absolute bottom-3 text-[10px] tracking-[0.25em] uppercase text-diwali-gold/70 font-semibold">
                Private · For {recipientName}
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-diwali-gold font-semibold mt-6 mb-2">
              Break The Royal Seal
            </p>
            <p className="text-xs text-diwali-muted">
              Tap the envelope to unveil a heartfelt message
            </p>
          </div>
        ) : (
          /* Opened Parchment Letter */
          <div className="w-full p-8 md:p-10 rounded-3xl bg-amber-50/95 text-stone-900 border-2 border-diwali-gold/60 shadow-2xl backdrop-blur-md animate-fade-in relative">
            <div className="text-center mb-6 pb-4 border-b border-amber-900/20">
              <span className="text-[11px] tracking-[0.3em] uppercase text-amber-800 font-bold block mb-1">
                Dearest {recipientName}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-950">
                A Diwali Letter From The Heart
              </h3>
            </div>

            <p className="font-serif text-sm md:text-base leading-relaxed text-stone-800 italic text-center px-2 mb-8">
              "{message}"
            </p>

            <div className="text-center pt-4 border-t border-amber-900/20">
              <span className="text-xs font-semibold text-amber-900 tracking-wider">
                With Deep Affection & Warmth · Happy Diwali
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May these words stay close to you throughout the season.
      </footer>
    </main>
  );
}

