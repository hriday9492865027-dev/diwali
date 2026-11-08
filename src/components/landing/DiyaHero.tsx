"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DiyaHeroProps {
  className?: string;
  size?: number;
}

export function DiyaHero({ className, size = 280 }: DiyaHeroProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size * 0.8 }}
    >
      <svg
        viewBox="0 0 320 260"
        className="w-full h-full filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flame radiant halos */}
          <radialGradient id="flameHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#ea580c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#02040a" stopOpacity="0" />
          </radialGradient>

          {/* Diya Clay Shading */}
          <linearGradient id="clayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="40%" stopColor="#7c2d12" />
            <stop offset="80%" stopColor="#431407" />
            <stop offset="100%" stopColor="#1e0b04" />
          </linearGradient>

          {/* Golden Brass Rim */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5c042" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#f5c042" />
          </linearGradient>

          {/* Flame Core Gradient */}
          <linearGradient id="flameGradient" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Ambient flame light cast onto scene */}
        <circle cx="160" cy="95" r="90" fill="url(#flameHalo)" className="animate-pulse-slow" />

        {/* Dynamic Flame Animation */}
        <g className="animate-flicker origin-bottom" style={{ transformOrigin: "160px 125px" }}>
          {/* Outer orange flame */}
          <path
            d="M 160 30 Q 185 85 175 115 Q 165 130 160 130 Q 155 130 145 115 Q 135 85 160 30 Z"
            fill="url(#flameGradient)"
            filter="drop-shadow(0 0 12px #f59e0b)"
          />
          {/* Inner bright yellow core */}
          <path
            d="M 160 55 Q 175 92 169 114 Q 163 124 160 124 Q 157 124 151 114 Q 145 92 160 55 Z"
            fill="#fffbeb"
            filter="drop-shadow(0 0 8px #fef08a)"
          />
          {/* White-hot center spark */}
          <ellipse cx="160" cy="115" rx="3.5" ry="6" fill="#ffffff" />
        </g>

        {/* Diya Wick */}
        <path d="M 160 125 Q 162 135 164 142" stroke="#262626" strokeWidth="3" strokeLinecap="round" />

        {/* Diya Clay Base Body */}
        <path
          d="M 60 150 C 70 215 250 215 260 150 C 265 140 250 140 240 142 C 200 150 120 150 80 142 C 70 140 55 140 60 150 Z"
          fill="url(#clayGradient)"
          stroke="#9a3412"
          strokeWidth="1.5"
        />

        {/* Diya Rim with intricate etched ornaments */}
        <ellipse cx="160" cy="144" rx="98" ry="16" fill="#431407" stroke="url(#goldRim)" strokeWidth="2.5" />
        <ellipse cx="160" cy="145" rx="84" ry="11" fill="#290e05" />

        {/* Golden Motifs on the Clay Bowl */}
        <path
          d="M 90 162 Q 160 195 230 162"
          stroke="url(#goldRim)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          className="opacity-70"
        />
        <circle cx="160" cy="182" r="3.5" fill="url(#goldRim)" />
        <circle cx="130" cy="178" r="2.5" fill="url(#goldRim)" />
        <circle cx="190" cy="178" r="2.5" fill="url(#goldRim)" />
      </svg>
    </div>
  );
}

