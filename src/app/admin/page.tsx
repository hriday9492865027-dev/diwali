import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { Users, Image as ImageIcon, Shield, Plus, Sparkles, ExternalLink, LogOut } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  let totalStudents = 1;
  let activeStudents = 1;
  let totalPhotos = 3;
  let studentList: Array<{
    id: string;
    rollNumber: string;
    displayName: string;
    greetingMessage?: string | null;
    isActive: boolean;
    createdAt: Date;
  }> = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      rollNumber: "21BCE1001",
      displayName: "Aarav Sharma",
      greetingMessage: "May the divine warmth of Diwali fill your heart with light!",
      isActive: true,
      createdAt: new Date(),
    },
  ];

  if (db) {
    try {
      const studentCountResult = await db.select({ value: count() }).from(schema.students);
      totalStudents = Number(studentCountResult[0]?.value || 0);

      const activeCountResult = await db
        .select({ value: count() })
        .from(schema.students)
        .where(eq(schema.students.isActive, true));
      activeStudents = Number(activeCountResult[0]?.value || 0);

      const photoCountResult = await db.select({ value: count() }).from(schema.studentPhotos);
      totalPhotos = Number(photoCountResult[0]?.value || 0);

      const records = await db.select().from(schema.students).limit(25);
      if (records.length > 0) {
        studentList = records;
      }
    } catch (err) {
      console.error("Admin data query error:", err);
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 select-none">
      {/* Admin Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 mb-8 border-b border-diwali-gold/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 flex items-center justify-center shadow-glow-gold">
            <Shield className="w-5 h-5 text-diwali-gold" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-[0.15em] text-gold-gradient uppercase">
              DEEPAVALI · Creator Console
            </h1>
            <p className="text-xs text-diwali-muted">Administrative Account & Media Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-diwali-gold bg-diwali-gold/10 border border-diwali-gold/30 hover:bg-diwali-gold/20 transition-colors"
          >
            <span>Preview Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Admin Section */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-diwali-muted font-semibold">
                Total Invited Students
              </span>
              <Users className="w-5 h-5 text-diwali-gold" />
            </div>
            <p className="text-3xl font-bold text-diwali-ivory">{totalStudents}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-diwali-muted font-semibold">
                Active Celebration Accounts
              </span>
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{activeStudents}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-diwali-muted font-semibold">
                Uploaded Private Portraits
              </span>
              <ImageIcon className="w-5 h-5 text-diwali-gold" />
            </div>
            <p className="text-3xl font-bold text-diwali-ivory">{totalPhotos}</p>
          </GlassCard>
        </div>

        {/* Student Accounts Table & Management */}
        <GlassCard className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-diwali-ivory uppercase tracking-wider">
                Student Celebration Accounts
              </h2>
              <p className="text-xs text-diwali-muted mt-1">
                Manage login credentials, custom greetings, and assigned memory portraits
              </p>
            </div>

            <Link href="/admin/students/new">
              <DiwaliButton size="sm">
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Provision Student</span>
                </span>
              </DiwaliButton>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-diwali-gold">
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Display Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {studentList.map((st) => (
                  <tr key={st.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-diwali-gold">
                      {st.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 text-diwali-ivory">{st.displayName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          st.isActive
                            ? "bg-green-950/70 text-green-300 border border-green-500/30"
                            : "bg-red-950/70 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {st.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/activities/portrait`}
                        className="text-xs text-diwali-gold hover:underline mr-4"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/students/${st.id}`}
                        className="text-xs text-diwali-muted hover:text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

