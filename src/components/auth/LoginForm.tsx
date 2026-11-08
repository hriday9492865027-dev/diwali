"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { DiwaliButton } from "@/components/ui/DiwaliButton";
import { Eye, EyeOff, Lock, User, ArrowLeft, Sparkles } from "lucide-react";

interface LoginFormProps {
  mode?: "student" | "admin";
}

export function LoginForm({ mode = "student" }: LoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMessage("Please enter both your ID and password.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "student" ? "/api/auth/student/login" : "/api/auth/admin/login";
      const payload =
        mode === "student"
          ? { rollNumber: cleanId, password }
          : { username: cleanId, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Those details do not match. Please try again.");
        setIsLoading(false);
        return;
      }

      // Successful login
      if (mode === "student") {
        router.push("/welcome");
      } else {
        router.push("/admin");
      }
    } catch {
      setErrorMessage("Unable to connect to celebration servers. Please try again.");
      setIsLoading(false);
    }
  };

  const isStudent = mode === "student";

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative ambient glowing orbs behind glass (inspired by Reference 03) */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-diwali-gold/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-diwali-saffron/20 rounded-full blur-3xl pointer-events-none" />

      <GlassCard glow className="relative z-10 p-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-diwali-muted hover:text-diwali-gold transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to entrance</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-diwali-gold/10 border border-diwali-gold/30 mb-3 shadow-glow-gold">
            <Sparkles className="w-5 h-5 text-diwali-gold animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-[0.15em] text-gold-gradient uppercase">
            {isStudent ? "Welcome Guest" : "Creator Access"}
          </h2>
          <p className="text-xs text-diwali-muted mt-1.5">
            {isStudent
              ? "Sign in with your assigned college credentials"
              : "Administrative controls and celebration manager"}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 text-center animate-shake"
          >
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier-input"
              className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold"
            >
              {isStudent ? "Enter Your Roll Number" : "Administrator Username"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-diwali-muted/60">
                <User className="w-4 h-4" />
              </div>
              <input
                id="identifier-input"
                type="text"
                autoComplete={isStudent ? "username" : "username"}
                autoFocus
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isStudent ? "e.g. 21BCE1024" : "admin"}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold focus:ring-1 focus:ring-diwali-gold transition-colors duration-200"
              />
            </div>
            {isStudent && (
              <p className="text-[11px] text-diwali-muted/60">
                Your assigned college registration ID
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password-input"
              className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold"
            >
              {isStudent ? "Enter Password (DOB)" : "Password"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-diwali-muted/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isStudent ? "DDMMYYYY" : "••••••••"}
                className="w-full pl-10 pr-11 py-3 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold focus:ring-1 focus:ring-diwali-gold transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-diwali-muted/60 hover:text-diwali-gold focus:outline-none transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isStudent && (
              <p className="text-[11px] text-diwali-muted/60">
                Format: 8-digit Date of Birth (e.g. 15082003)
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <DiwaliButton
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isStudent ? "Unlock Your Celebration" : "Access Creator Console"}
            </DiwaliButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

