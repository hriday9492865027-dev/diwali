"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FloralArchway } from "./FloralArchway";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import { Sparkles, Volume2, VolumeX, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface WelcomeCinematicProps {
  displayName: string;
}

type CinematicStage = "DARKEN" | "LAUNCH" | "EXPLOSION" | "GREETING" | "HOLD";

export function WelcomeCinematic({ displayName }: WelcomeCinematicProps) {
  const router = useRouter();
  const [stage, setStage] = useState<CinematicStage>("DARKEN");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play synthesized web audio fireworks sound
  const playFireworkSound = (type: "launch" | "burst") => {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (type === "launch") {
        // Rocket ascending whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === "burst") {
        // Firework explosion boom & crackle
        const bufferSize = ctx.sampleRate * 0.8;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }
    } catch {
      // Audio playback best effort
    }
  };

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("HOLD");
      return;
    }

    // Timeline Sequence (PRD §5.0)
    // 0-1s: Darken
    const tLaunch = setTimeout(() => {
      setStage("LAUNCH");
      playFireworkSound("launch");
    }, 800);

    // 1-3s: Rocket ascends -> 3s: Explosion
    const tExplode = setTimeout(() => {
      setStage("EXPLOSION");
      playFireworkSound("burst");

      // Trigger celebratory sparks burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.45 },
        colors: ["#f5c042", "#fef08a", "#ea580c", "#f97316", "#ffffff"],
        disableForReducedMotion: true,
      });
    }, 2800);

    // 3.8s: Happy Diwali + Personalized Name reveals
    const tGreeting = setTimeout(() => {
      setStage("GREETING");
    }, 3800);

    // 5.5s: Hold & reveal Continue action
    const tHold = setTimeout(() => {
      setStage("HOLD");
    }, 5500);

    return () => {
      clearTimeout(tLaunch);
      clearTimeout(tExplode);
      clearTimeout(tGreeting);
      clearTimeout(tHold);
    };
  }, [soundEnabled]);

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <FloralArchway>
      {/* Controls Bar: Sound Toggle & Skip */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-full bg-black/40 border border-diwali-gold/30 text-diwali-gold hover:bg-black/60 transition-colors"
          aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={handleSkip}
          className="text-xs tracking-wider uppercase text-diwali-muted hover:text-diwali-gold transition-colors px-3 py-1.5 rounded-full bg-black/30 border border-diwali-border"
        >
          Skip to World
        </button>
      </div>

      {/* Stage: Rocket Ascent */}
      {stage === "LAUNCH" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-rocket-ascent">
          {/* Glowing Rocket Head */}
          <div className="w-4 h-8 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full shadow-glow-flame" />
          {/* Flame & Spark Trail */}
          <div className="w-1.5 h-16 bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent blur-[1px] animate-pulse" />
        </div>
      )}

      {/* Stage: Radial Explosion Flash */}
      {stage === "EXPLOSION" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 blur-2xl animate-ping opacity-75" />
        </div>
      )}

      {/* Stages: Greeting & Hold */}
      {(stage === "GREETING" || stage === "HOLD") && (
        <div className="relative z-20 text-center max-w-2xl px-6 py-8 flex flex-col items-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 text-xs tracking-[0.25em] uppercase text-diwali-gold font-semibold mb-4 shadow-glow-gold">
            <Sparkles className="w-3.5 h-3.5 text-diwali-gold animate-pulse" />
            <span>Festival of Lights</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.15em] text-gold-gradient uppercase drop-shadow-[0_4px_30px_rgba(245,192,66,0.4)] mb-3">
            HAPPY DIWALI
          </h1>

          <div className="my-3">
            <span className="text-sm md:text-base tracking-[0.2em] uppercase text-diwali-muted block mb-1">
              Honoring Our Cherished Guest
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider text-fire-gradient">
              {displayName}
            </h2>
          </div>

          <p className="text-xs md:text-sm text-diwali-ivory/80 font-light max-w-md mx-auto my-4 leading-relaxed">
            May this Diwali illuminate your path with joy, success, and endless wonder. Your celebration world is waiting.
          </p>

          {/* Continue Action */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <DiwaliButton
              size="lg"
              onClick={handleSkip}
              className="group min-w-[240px]"
            >
              <span>Enter My Diwali World</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </DiwaliButton>
          </div>
        </div>
      )}
    </FloralArchway>
  );
}

