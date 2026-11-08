import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function GlassCard({ className, glow = false, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl glass-gold-card p-6 md:p-8 transition-all duration-300",
        glow && "shadow-glow-gold/40 border-diwali-gold/40",
        className
      )}
      {...props}
    >
      {/* Subtle interior gold accent corner lights */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none border-t border-l border-diwali-gold/30 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t border-r border-diwali-gold/30 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b border-l border-diwali-gold/30 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none border-b border-r border-diwali-gold/30 rounded-br-2xl" />
      {children}
    </div>
  );
}
