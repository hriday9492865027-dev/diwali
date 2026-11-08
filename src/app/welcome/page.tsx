import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { WelcomeCinematic } from "@/components/welcome/WelcomeCinematic";
import { AmbientParticles } from "@/components/landing/AmbientParticles";

export default async function WelcomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  return (
    <main className="relative min-h-screen w-full bg-diwali-night overflow-hidden select-none">
      <AmbientParticles />
      <WelcomeCinematic displayName={session.displayName} />
    </main>
  );
}
