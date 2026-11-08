"use client";

import React from "react";
import Link from "next/link";
import { MandalaOrnament } from "@/components/landing/MandalaOrnament";
import { DiyaHero } from "@/components/landing/DiyaHero";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import { Sparkles, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night px-4 py-8 select-none">
      {/* Background Ambient Sparks & Stars */}
      <AmbientParticles />

      {/* Top Festival Header Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-diwali-gold animate-pulse shadow-glow-gold" />
          <span className="text-xs tracking-[0.3em] uppercase text-diwali-gold/80 font-medium">
            Personalized Celebration
          </span>
        </div>

        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 text-xs text-diwali-muted/70 hover:text-diwali-gold transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-diwali-gold/20"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Creator Portal</span>
        </Link>
      </header>

      {/* Central Visual Focus: Mandala + Diya + Festive Title */}
      <section className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-3xl">
        {/* Layered Sacred Mandala & Glowing Diya */}
        <div className="relative flex items-center justify-center mb-6">
          <MandalaOrnament size={460} className="scale-75 md:scale-100 opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <DiyaHero size={260} className="scale-90 md:scale-105" />
          </div>
        </div>

        {/* Festive Title with Royal Golden Shimmer */}
        <div className="space-y-3 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-diwali-gold/10 border border-diwali-gold/20 text-[11px] tracking-[0.25em] uppercase text-diwali-gold font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-diwali-gold animate-pulse" />
            <span>शुभ दीपावली</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.18em] text-gold-gradient uppercase drop-shadow-[0_4px_24px_rgba(245,192,66,0.3)]">
            DEEPAVALI
          </h1>

          <p className="text-sm md:text-base text-diwali-ivory/80 font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            Welcome to your personalized digital celebration. Step inside to ignite your memories, launch celebratory fireworks, and unveil light crafted for you.
          </p>
        </div>

        {/* Primary Call to Action: ENTER */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/login" tabIndex={-1}>
            <DiwaliButton size="lg" className="min-w-[220px]">
              Enter Celebration
            </DiwaliButton>
          </Link>
          <span className="text-[11px] tracking-widest text-diwali-muted/60 uppercase">
            Private Access · College Roll Number & DOB
          </span>
        </div>
      </section>

      {/* Footer Details */}
      <footer className="relative z-10 w-full max-w-4xl text-center py-4 text-xs text-diwali-muted/50 border-t border-diwali-gold/10">
        <p className="tracking-wider">
          May the divine light of Diwali bring peace, joy, and endless prosperity to your life.
        </p>
      </footer>
    </main>
  );
}

