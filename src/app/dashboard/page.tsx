import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Sparkles,
  Flame,
  Send,
  Gift,
  Image as ImageIcon,
  Palette,
  Mail,
  Zap,
  LogOut,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  const activities = [
    {
      id: "portrait",
      title: "Particle Portrait Fireworks",
      subtitle: "Launch celebratory rockets to unveil your memories sculpted in glowing starlight",
      icon: Sparkles,
      href: "/activities/portrait",
      featured: true,
      badge: "Signature Showcase",
      glowColor: "from-amber-500/20 via-orange-500/10 to-transparent",
    },
    {
      id: "diya",
      title: "Light a Diya",
      subtitle: "Ignite sacred earthen lamps with warm light and receive timeless Diwali blessings",
      icon: Flame,
      href: "/activities/diya",
      featured: false,
      badge: "Tradition",
    },
    {
      id: "lanterns",
      title: "Virtual Sky Lanterns",
      subtitle: "Inscribe your heartfelt wishes and release glowing lanterns into the night sky",
      icon: Send,
      href: "/activities/lanterns",
      featured: false,
      badge: "Wishes",
    },
    {
      id: "gift",
      title: "Surprise Gift Box",
      subtitle: "Unwrap a celebratory Diwali gift box with confetti and a personalized surprise",
      icon: Gift,
      href: "/activities/gift",
      featured: false,
      badge: "Surprise",
    },
    {
      id: "memory-wall",
      title: "Memory Wall",
      subtitle: "Browse your curated photo gallery with nostalgic Polaroid cards and captions",
      icon: ImageIcon,
      href: "/activities/memory-wall",
      featured: false,
      badge: "Gallery",
    },
    {
      id: "secret-message",
      title: "Secret Diwali Message",
      subtitle: "Break an ornate wax seal to unveil a private letter written specially for you",
      icon: Mail,
      href: "/activities/secret-message",
      featured: false,
      badge: "Personal",
    },
    {
      id: "rangoli",
      title: "Rangoli Creator & Fireworks",
      subtitle: "Draw kaleidoscopic symmetrical sand art and fire crackers that blast in your Rangoli geometry",
      icon: Palette,
      href: "/activities/rangoli",
      featured: false,
      badge: "Creative & Blast",
    },
    {
      id: "finale",
      title: "The Grand Finale",
      subtitle: "Experience a synchronized multi-stage fireworks show and holiday grand blessing",
      icon: Zap,
      href: "/activities/finale",
      featured: false,
      badge: "Spectacle",
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 select-none">
      <AmbientParticles />

      {/* Top Navigation & Header */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between pb-6 mb-8 border-b border-diwali-gold/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 flex items-center justify-center shadow-glow-gold">
            <Flame className="w-5 h-5 text-diwali-gold" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-[0.15em] text-gold-gradient uppercase">
              DEEPAVALI
            </h1>
            <p className="text-xs text-diwali-muted">
              Celebration Hub · Welcome, <span className="text-diwali-gold font-medium">{session.displayName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-diwali-muted hover:text-red-400 bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold-gradient uppercase tracking-wider mb-2">
            Your Diwali Celebration World
          </h2>
          <p className="text-xs md:text-sm text-diwali-ivory/70 leading-relaxed">
            Select any activity below to experience light, music, and art crafted exclusively for you. Start with your signature particle fireworks portrait!
          </p>
        </div>

        {/* Featured Signature Feature Card (Full Width) */}
        {activities
          .filter((a) => a.featured)
          .map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.id} href={card.href} className="block group">
                <GlassCard
                  glow
                  className="relative overflow-hidden p-6 md:p-8 border-diwali-gold/40 hover:border-diwali-gold transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-glow-flame group-hover:scale-105 transition-transform flex-shrink-0">
                        <Icon className="w-7 h-7 text-diwali-night" />
                      </div>
                      <div>
                        <span className="inline-block px-3 py-0.5 rounded-full text-[10px] tracking-widest font-bold uppercase bg-diwali-gold/20 text-diwali-gold border border-diwali-gold/40 mb-2">
                          {card.badge}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-diwali-ivory group-hover:text-diwali-gold transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs md:text-sm text-diwali-muted mt-1 max-w-xl">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-diwali-gold text-diwali-night text-xs font-bold uppercase tracking-wider shadow-glow-gold group-hover:shadow-glow-gold-lg group-hover:scale-105 transition-all flex-shrink-0">
                      <span>Launch Experience</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}

        {/* Standard Activity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities
            .filter((a) => !a.featured)
            .map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.id} href={card.href} className="block group">
                  <GlassCard className="h-full flex flex-col justify-between p-6 border-diwali-border hover:border-diwali-gold/50 hover:bg-diwali-card/90 transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-diwali-gold/10 border border-diwali-gold/20 flex items-center justify-center text-diwali-gold group-hover:scale-110 group-hover:bg-diwali-gold/20 transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] tracking-widest uppercase text-diwali-muted/70 font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {card.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-diwali-ivory group-hover:text-diwali-gold transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-xs text-diwali-muted mt-1.5 leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-diwali-gold/70 group-hover:text-diwali-gold font-medium">
                      <span>Explore</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto text-center mt-16 pt-6 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        <p>DEEPAVALI · Personalized Festival of Lights Platform</p>
      </footer>
    </main>
  );
}
