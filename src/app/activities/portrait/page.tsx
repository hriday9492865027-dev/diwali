import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ParticlePortraitEngine } from "@/components/portrait/ParticlePortraitEngine";
import { AmbientParticles } from "@/components/landing/AmbientParticles";
import { PhotoAsset } from "@/lib/particles/types";

export default async function PortraitActivityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  let photos: PhotoAsset[] = [];

  if (db && session.role === "STUDENT") {
    const records = await db
      .select({
        id: schema.studentPhotos.id,
        caption: schema.studentPhotos.caption,
        displayOrder: schema.studentPhotos.displayOrder,
      })
      .from(schema.studentPhotos)
      .where(eq(schema.studentPhotos.studentId, session.userId))
      .orderBy(schema.studentPhotos.displayOrder);

    photos = records.map((r: { id: string; caption?: string | null }) => ({
      id: r.id,
      url: `/api/media/student-photo/${r.id}`,
      caption: r.caption,
    }));
  }

  // If no photos uploaded yet or in development fallback mode, use high-fidelity test portrait references
  if (photos.length === 0) {
    photos = [
      {
        id: "sample-1",
        url: "/test-portraits/sample-portrait-1.jpg",
        caption: "Diwali Spark of Joy — Aarav",
      },
      {
        id: "sample-2",
        url: "/test-portraits/sample-portrait-2.jpg",
        caption: "Lighting the Festive Night — Warmth & Smiles",
      },
      {
        id: "sample-3",
        url: "/test-portraits/sample-portrait-3.jpg",
        caption: "Together in Celebration — Golden Moments",
      },
    ];
  }

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory overflow-hidden select-none">
      <AmbientParticles />
      <ParticlePortraitEngine photos={photos} studentName={session.displayName} />
    </main>
  );
}
