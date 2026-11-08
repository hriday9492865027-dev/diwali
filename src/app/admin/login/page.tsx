import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AmbientParticles } from "@/components/landing/AmbientParticles";

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night overflow-hidden select-none">
      <AmbientParticles />
      <LoginForm mode="admin" />
    </main>
  );
}

