"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, X, Image as ImageIcon, ZoomIn } from "lucide-react";
import { AmbientParticles } from "@/components/landing/AmbientParticles";

interface MemoryPhoto {
  id: string;
  url: string;
  caption: string;
}

export default function MemoryWallActivityPage() {
  const [photos, setPhotos] = useState<MemoryPhoto[]>([
    {
      id: "1",
      url: "/test-portraits/sample-portrait-1.jpg",
      caption: "Diwali Spark of Joy — Celebrating Traditions",
    },
    {
      id: "2",
      url: "/test-portraits/sample-portrait-2.jpg",
      caption: "Lighting the Festive Night — Warmth & Smiles",
    },
    {
      id: "3",
      url: "/test-portraits/sample-portrait-3.jpg",
      caption: "Golden Moments — Cherished Memories",
    },
  ]);

  const [activePhoto, setActivePhoto] = useState<MemoryPhoto | null>(null);

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.photos && data.photos.length > 0) {
          const mapped = data.photos.map((p: { id: string; caption?: string }) => ({
            id: p.id,
            url: `/api/media/student-photo/${p.id}`,
            caption: p.caption || "Diwali Celebration Memory",
          }));
          setPhotos(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 flex flex-col justify-between overflow-hidden select-none">
      <AmbientParticles />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-diwali-gold/15">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-diwali-gold/30 text-xs text-diwali-ivory hover:text-diwali-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold tracking-[0.18em] text-gold-gradient uppercase">
            Memory Wall
          </h1>
          <p className="text-[11px] text-diwali-muted">Polaroids of Celebration</p>
        </div>

        <div className="w-16" />
      </header>

      {/* Polaroid Gallery Grid */}
      <div className="relative z-10 max-w-5xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {photos.map((photo, idx) => {
            const rotations = ["-rotate-2", "rotate-1", "rotate-3", "-rotate-1"];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className={`cursor-pointer transform ${rot} hover:rotate-0 hover:scale-105 transition-all duration-300 group`}
              >
                {/* Polaroid Frame */}
                <div className="bg-white p-3.5 pb-6 rounded-md shadow-2xl border border-stone-200 w-64 flex flex-col items-center">
                  <div className="relative w-full h-72 bg-stone-900 rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/test-portraits/sample-portrait-1.jpg";
                      }}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-8 h-8 filter drop-shadow" />
                    </div>
                  </div>
                  <p className="mt-4 text-center font-serif text-xs text-stone-800 tracking-wide line-clamp-2 px-1">
                    {photo.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-white p-4 pb-8 rounded-xl shadow-2xl flex flex-col items-center animate-scale-up"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-800 text-white hover:bg-stone-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full h-96 bg-stone-900 rounded-lg overflow-hidden mt-6">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/test-portraits/sample-portrait-1.jpg";
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mt-6 text-center font-serif text-sm font-semibold text-stone-900 px-4">
              {activePhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-diwali-gold/10 text-xs text-diwali-muted/60">
        May these memories bring a warm smile whenever you look back.
      </footer>
    </main>
  );
}

