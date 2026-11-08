"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DiwaliButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const DiwaliButton = React.forwardRef<HTMLButtonElement, DiwaliButtonProps>(
  ({ className, variant = "gold", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-xs tracking-wider",
      md: "px-6 py-3 text-sm tracking-widest",
      lg: "px-8 py-4 text-base tracking-[0.2em]",
    };

    const variantClasses = {
      gold: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-diwali-night font-bold shadow-glow-gold hover:shadow-glow-gold-lg hover:scale-[1.02] active:scale-[0.98] border border-amber-300/40",
      secondary: "bg-diwali-card/80 text-diwali-gold border border-diwali-gold/30 hover:border-diwali-gold hover:bg-diwali-deep/90 hover:shadow-glow-gold",
      danger: "bg-red-950/80 text-red-200 border border-red-500/40 hover:bg-red-900 hover:border-red-400",
      ghost: "bg-transparent text-diwali-muted hover:text-diwali-gold hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative inline-flex items-center justify-center uppercase rounded-full transition-all duration-300 font-semibold select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-diwali-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-diwali-night disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

DiwaliButton.displayName = "DiwaliButton";

