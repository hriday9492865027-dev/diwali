"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Flame } from "lucide-react";

export function FestiveSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gain: GainNode;
  } | null>(null);

  // Initialize Web Audio Drone Synthesizer
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      return ctx;
    } catch {
      return null;
    }
  }, []);

  const startSoundscape = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (droneNodesRef.current) return;

    // Harmonic Tanpura / Meditative Diwali Drone (C-G chord: 130.81Hz, 196.00Hz, 261.63Hz)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3.0); // Gentle fade-in

    // Warm Lowpass Filter (eliminates harsh high frequencies)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, ctx.currentTime);

    // Warm LFO (Subtle flame pulse shimmer)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 5-second gentle wave
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Harmonic Frequencies for classical Diwali warmth
    const frequencies = [130.81, 196.0, 261.63, 392.0];
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle detune for rich choral chorus effect
      const detuneAmount = (idx - 1.5) * 4;
      osc.detune.setValueAtTime(detuneAmount, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(1.0 / (idx + 1.8), ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscillators.push(osc);
    });

    droneNodesRef.current = { oscillators, gain: masterGain };
    setIsPlaying(true);
  }, [initAudio]);

  const stopSoundscape = useCallback(() => {
    if (!audioCtxRef.current || !droneNodesRef.current) return;
    const ctx = audioCtxRef.current;
    const { oscillators, gain } = droneNodesRef.current;

    // Fade out smoothly
    try {
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => {
        oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        droneNodesRef.current = null;
        setIsPlaying(false);
      }, 1250);
    } catch {
      droneNodesRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const toggleSoundscape = () => {
    setHasInteracted(true);
    if (isPlaying) {
      stopSoundscape();
      localStorage.setItem("deepavali_music_enabled", "false");
    } else {
      startSoundscape();
      localStorage.setItem("deepavali_music_enabled", "true");
    }
  };

  useEffect(() => {
    // Restore preference if user previously opted in
    const pref = localStorage.getItem("deepavali_music_enabled");
    if (pref === "true") {
      const handleFirstInteraction = () => {
        startSoundscape();
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      };
      window.addEventListener("click", handleFirstInteraction);
      window.addEventListener("keydown", handleFirstInteraction);
      return () => {
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      };
    }
  }, [startSoundscape]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group">
      {/* Tooltip hint on hover */}
      <span className="hidden sm:inline-block px-3 py-1 text-[11px] font-medium tracking-wide text-diwali-gold bg-black/80 border border-diwali-gold/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md pointer-events-none shadow-glow-gold">
        {isPlaying ? "Festive Soundscape Active" : "Play Ambient Soundscape"}
      </span>

      {/* Floating Diya Music Toggle Button */}
      <button
        onClick={toggleSoundscape}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 shadow-lg ${
          isPlaying
            ? "bg-diwali-gold/25 border-diwali-gold text-diwali-gold shadow-glow-gold scale-105"
            : "bg-black/60 border-diwali-gold/30 text-diwali-ivory/70 hover:text-diwali-gold hover:border-diwali-gold/60 hover:scale-105"
        }`}
        aria-label={isPlaying ? "Mute ambient music" : "Play ambient music"}
        title={isPlaying ? "Mute Diwali Soundscape" : "Play Diwali Soundscape"}
      >
        {/* Pulsing flame aura when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full bg-diwali-gold/20 animate-ping pointer-events-none" />
        )}

        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <Flame className="w-5 h-5 text-diwali-gold animate-flame-flicker fill-diwali-gold/30" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </div>
      </button>
    </div>
  );
}

