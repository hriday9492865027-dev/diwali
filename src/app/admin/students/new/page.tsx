"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

export default function NewStudentPage() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rollNumber.trim() || !displayName.trim() || !password.trim()) {
      setError("Roll Number, Display Name, and Password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          displayName,
          password,
          greetingMessage,
          secretMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 select-none">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs text-diwali-muted hover:text-diwali-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Creator Console</span>
        </Link>

        <GlassCard glow className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 flex items-center justify-center text-diwali-gold shadow-glow-gold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gold-gradient uppercase tracking-wider">
                Provision Student Account
              </h1>
              <p className="text-xs text-diwali-muted">
                Create private credentials and configure personalized Diwali messages
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                  College Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21BCE1001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Initial Password (DOB Format) *
              </label>
              <input
                type="text"
                required
                placeholder="DDMMYYYY (e.g. 15082003)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold"
              />
              <p className="text-[11px] text-diwali-muted/60">
                Will be hashed with Argon2id immediately. Plaintext password is never stored.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Personalized Welcome Greeting
              </label>
              <textarea
                rows={2}
                placeholder="e.g. May the divine warmth of Diwali fill your heart with light!"
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Secret Message (Envelope & Gift Box)
              </label>
              <textarea
                rows={3}
                placeholder="A private heartfelt message revealed in the surprise activities..."
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/admin">
                <DiwaliButton type="button" variant="ghost" size="sm">
                  Cancel
                </DiwaliButton>
              </Link>
              <DiwaliButton type="submit" size="md" isLoading={isLoading}>
                Create Celebration Account
              </DiwaliButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}
