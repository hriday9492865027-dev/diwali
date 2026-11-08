"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Sparkles, FileText, UploadCloud, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

interface ParsedStudent {
  rollNumber: string;
  displayName: string;
  password: string;
  greetingMessage?: string;
  secretMessage?: string;
}

export default function NewStudentPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single mode state
  const [rollNumber, setRollNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk mode state
  const [csvText, setCsvText] = useState("");
  const [parsedList, setParsedList] = useState<ParsedStudent[]>([]);
  const [bulkResult, setBulkResult] = useState<{ inserted: number; skipped: number } | null>(null);

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

  const handleCsvChange = (raw: string) => {
    setCsvText(raw);
    setError(null);
    setBulkResult(null);

    if (!raw.trim()) {
      setParsedList([]);
      return;
    }

    const lines = raw.trim().split("\n");
    if (lines.length <= 1) {
      setParsedList([]);
      return;
    }

    // Skip header line if it contains "roll" or "name"
    const startIdx = lines[0].toLowerCase().includes("roll") ? 1 : 0;
    const parsed: ParsedStudent[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length >= 3) {
        parsed.push({
          rollNumber: parts[0],
          displayName: parts[1],
          password: parts[2],
          greetingMessage: parts[3] || undefined,
          secretMessage: parts[4] || undefined,
        });
      }
    }

    setParsedList(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleCsvChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = `rollNumber,displayName,password,greetingMessage,secretMessage
21BCE1005,Kavya Reddy,05042003,May your path shine with brilliance and glory!,Your leadership on campus is truly appreciated.
21BCE1006,Aditya Nair,18122002,Wishing you victory and triumph in every challenge!,Keep striving for excellence.
21BCE1007,Sneha Sen,09092003,May the festival of lights fill your life with sweet memories!,Your warm smile illuminates every gathering.`;
    handleCsvChange(sample);
  };

  const handleBulkSubmit = async () => {
    if (parsedList.length === 0) {
      setError("Please provide at least one valid student record.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedList }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to process bulk import.");
        setIsLoading(false);
        return;
      }

      setBulkResult({ inserted: data.inserted, skipped: data.skipped });
      setIsLoading(false);
    } catch {
      setError("Network error during bulk provisioning.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs text-diwali-muted hover:text-diwali-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Creator Console</span>
        </Link>

        {/* Segmented Mode Selector */}
        <div className="flex items-center gap-2 p-1 bg-black/40 border border-diwali-border rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              mode === "single"
                ? "bg-diwali-gold text-diwali-night shadow-glow-gold"
                : "text-diwali-muted hover:text-diwali-ivory"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Single Student</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              mode === "bulk"
                ? "bg-diwali-gold text-diwali-night shadow-glow-gold"
                : "text-diwali-muted hover:text-diwali-ivory"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>
        </div>

        <GlassCard glow className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-diwali-gold/15 border border-diwali-gold/30 flex items-center justify-center text-diwali-gold shadow-glow-gold">
              {mode === "single" ? <UserPlus className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gold-gradient uppercase tracking-wider">
                {mode === "single" ? "Provision Student Account" : "Bulk Student Provisioning"}
              </h1>
              <p className="text-xs text-diwali-muted">
                {mode === "single"
                  ? "Create private credentials and configure personalized Diwali messages"
                  : "Batch-import hundreds of students simultaneously via CSV spreadsheet"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          {mode === "single" ? (
            /* Single Student Form */
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
                <input
                  type="text"
                  placeholder="e.g. May the light of Diwali brighten your path!"
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                  Secret Letter / Private Message
                </label>
                <textarea
                  rows={3}
                  placeholder="A secret personalized Diwali blessing revealed inside the Secret Message activity..."
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold resize-none"
                />
              </div>

              <div className="pt-2">
                <DiwaliButton type="submit" size="lg" isLoading={isLoading} className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Create Student Account</span>
                  </span>
                </DiwaliButton>
              </div>
            </form>
          ) : (
            /* Bulk CSV Mode */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-black/30 border border-diwali-gold/20">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-diwali-gold">Upload CSV File or Paste Raw Content</p>
                  <p className="text-[11px] text-diwali-muted">
                    Columns: <code className="text-diwali-ivory">rollNumber, displayName, password, greeting, secret</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3 py-1.5 rounded-lg text-xs text-diwali-gold bg-diwali-gold/10 border border-diwali-gold/30 hover:bg-diwali-gold/20 transition-colors"
                  >
                    Load Sample CSV
                  </button>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-diwali-gold text-diwali-night hover:bg-diwali-gold/90 transition-colors shadow-glow-gold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                    <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => handleCsvChange(e.target.value)}
                placeholder="Paste CSV rows here..."
                className="w-full px-4 py-3 bg-black/50 border border-diwali-border rounded-xl font-mono text-xs text-diwali-ivory placeholder-diwali-muted/40 focus:outline-none focus:border-diwali-gold"
              />

              {/* Parsed Preview Table */}
              {parsedList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-diwali-gold">
                    <span>Parsed Preview ({parsedList.length} students ready to provision)</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-diwali-border bg-black/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-diwali-card text-diwali-muted border-b border-diwali-border font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Roll Number</th>
                          <th className="p-2.5">Display Name</th>
                          <th className="p-2.5">Password</th>
                          <th className="p-2.5">Greeting</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {parsedList.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="p-2.5 text-diwali-gold font-bold">{row.rollNumber}</td>
                            <td className="p-2.5 text-diwali-ivory">{row.displayName}</td>
                            <td className="p-2.5 text-diwali-muted">••••••••</td>
                            <td className="p-2.5 text-diwali-muted truncate max-w-[200px]">
                              {row.greetingMessage || "Default"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bulkResult && (
                <div className="p-4 rounded-xl bg-green-950/60 border border-green-500/40 text-xs text-green-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-300">Batch Processing Complete!</p>
                    <p>Successfully provisioned {bulkResult.inserted} students. ({bulkResult.skipped} duplicate or skipped records).</p>
                  </div>
                </div>
              )}

              <DiwaliButton
                size="lg"
                onClick={handleBulkSubmit}
                isLoading={isLoading}
                disabled={parsedList.length === 0}
                className="w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Provision All {parsedList.length > 0 ? parsedList.length : ""} Students</span>
                </span>
              </DiwaliButton>
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
