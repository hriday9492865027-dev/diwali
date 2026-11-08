"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FloralArchwayProps {
  className?: string;
  children?: React.ReactNode;
}

export function FloralArchway({ className, children }: FloralArchwayProps) {
  return (
    <div className={cn("relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden", className)}>
      {/* Top and Side Marigold Toran Garland Frame */}
      <div className="absolute top-0 left-0 right-0 h-32 md:h-44 pointer-events-none z-20 overflow-hidden">
        {/* Arch Garland SVGs */}
        <svg
          viewBox="0 0 1200 240"
          className="w-full h-full preserve-3d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="marigoldOrange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            <radialGradient id="marigoldYellow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="fairyLightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Decorative Toran Swag Wave 1 */}
          <path
            d="M -50 0 Q 300 140 600 50 Q 900 140 1250 0"
            stroke="#14532d"
            strokeWidth="8"
            fill="none"
          />
          {/* Swag Wave 2 (Lower Arch) */}
          <path
            d="M 100 0 Q 600 210 1100 0"
            stroke="#166534"
            strokeWidth="12"
            fill="none"
          />

          {/* Marigold flower clusters along the swags */}
          {Array.from({ length: 48 }).map((_, i) => {
            const t = i / 47;
            const x = 50 + t * 1100;
            // Parabolic swag curve
            const y = Math.sin(t * Math.PI) * 160 + 20;
            const isYellow = i % 2 === 0;
            const radius = 14 + (i % 3) * 2;

            return (
              <g key={`flower-${i}`} transform={`translate(${x}, ${y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r={radius}
                  fill={isYellow ? "url(#marigoldYellow)" : "url(#marigoldOrange)"}
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                />
                {/* Petal texture ring */}
                <circle cx="0" cy="0" r={radius * 0.65} fill="none" stroke="#b45309" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                <circle cx="0" cy="0" r={radius * 0.3} fill="#78350f" opacity="0.4" />
              </g>
            );
          })}

          {/* Hanging Fairy String Lights */}
          {[180, 320, 480, 600, 720, 880, 1020].map((lx, idx) => {
            const hangLen = 70 + (idx % 3) * 35;
            return (
              <g key={`light-${idx}`} transform={`translate(${lx}, 20)`}>
                <line x1="0" y1="0" x2="0" y2={hangLen} stroke="#fbbf24" strokeWidth="1" opacity="0.7" />
                {/* Light bulb */}
                <circle cx="0" cy={hangLen} r="18" fill="url(#fairyLightGlow)" className="animate-pulse" />
                <circle cx="0" cy={hangLen} r="4" fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Side Marigold Garlands (Pillars) */}
      <div className="absolute top-0 bottom-0 left-0 w-8 md:w-16 pointer-events-none z-20 flex flex-col items-center justify-around opacity-90">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`left-garland-${i}`}
            className={cn(
              "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg -my-2 transform",
              i % 2 === 0
                ? "bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400"
                : "bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200"
            )}
          />
        ))}
      </div>

      <div className="absolute top-0 bottom-0 right-0 w-8 md:w-16 pointer-events-none z-20 flex flex-col items-center justify-around opacity-90">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`right-garland-${i}`}
            className={cn(
              "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg -my-2 transform",
              i % 2 === 0
                ? "bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400"
                : "bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200"
            )}
          />
        ))}
      </div>

      {/* Main Central Stage */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

