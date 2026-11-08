"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MandalaOrnamentProps {
  className?: string;
  size?: number;
}

export function MandalaOrnament({ className, size = 600 }: MandalaOrnamentProps) {
  return (
    <div
      className={cn("relative pointer-events-none select-none flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full text-diwali-gold/20 animate-spin_slow"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="mandalaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5c042" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ea580c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#02040a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient center radial glow */}
        <circle cx="300" cy="300" r="280" fill="url(#mandalaGlow)" />

        {/* Outer dotted orbit */}
        <circle
          cx="300"
          cy="300"
          r="260"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          className="opacity-40"
        />

        {/* Main outer ring */}
        <circle cx="300" cy="300" r="240" stroke="currentColor" strokeWidth="1" className="opacity-50" />
        <circle cx="300" cy="300" r="225" stroke="currentColor" strokeWidth="0.75" className="opacity-30" />

        {/* 16-point geometric petals */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={i} transform={`rotate(${angle} 300 300)`}>
              <path
                d="M 300 60 Q 320 140 300 220 Q 280 140 300 60 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="rgba(245, 192, 66, 0.02)"
                className="opacity-60"
              />
              <circle cx="300" cy="70" r="3" fill="currentColor" className="opacity-75 text-diwali-gold" />
            </g>
          );
        })}

        {/* Mid ring with 12 diamond petals */}
        <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={`mid-${i}`} transform={`rotate(${angle} 300 300)`}>
              <polygon
                points="300,140 315,180 300,220 285,180"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
                className="opacity-50"
              />
              <circle cx="300" cy="140" r="2" fill="currentColor" className="opacity-60" />
            </g>
          );
        })}

        {/* Inner core sacred geometry */}
        <circle cx="300" cy="300" r="90" stroke="currentColor" strokeWidth="1.2" className="opacity-60" />
        <circle cx="300" cy="300" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <path
              key={`core-${i}`}
              d="M 300 210 Q 312 255 300 300 Q 288 255 300 210 Z"
              stroke="currentColor"
              strokeWidth="0.8"
              transform={`rotate(${angle} 300 300)`}
              className="opacity-70"
            />
          );
        })}
      </svg>
    </div>
  );
}

