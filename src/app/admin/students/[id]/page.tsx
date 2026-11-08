"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, Sparkles, ExternalLink, Save } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DiwaliButton } from "@/components/ui/DiwaliButton";

interface StudentDetail {
  id: string;
  rollNumber: string;
  displayName: string;
  greetingMessage?: string;
  secretMessage?: string;
  isActive: boolean;
}

interface PhotoRecord {
  id: string;
  blobPathname: string;
  caption?: string | null;
  displayOrder: number;
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handlePreviewExperience = async () => {
    setIsPreviewing(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/preview`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setMessage(data.message || "Failed to launch student preview.");
        setIsPreviewing(false);
      }
    } catch {
      setMessage("Network error launching student preview.");
      setIsPreviewing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/admin/students/${studentId}`)
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok && data.student) {
          setStudent(data.student);
          setDisplayName(data.student.displayName);
          setGreetingMessage(data.student.greetingMessage || "");
          setSecretMessage(data.student.secretMessage || "");
          setIsActive(data.student.isActive);
          setPhotos(data.photos || []);
        } else {
          setFetchError(data.message || "Student profile could not be loaded.");
        }
      })
      .catch((err) => {
        if (isMounted) setFetchError("Network error while connecting to database.");
      });

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          greetingMessage,
          secretMessage,
          isActive,
        }),
      });

      if (res.ok) {
        setMessage("Student details updated successfully.");
      }
    } catch {
      setMessage("Failed to update student details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("caption", caption);
      formData.append("displayOrder", String(photos.length));

      const res = await fetch(`/api/admin/students/${studentId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.photo) {
        setPhotos((prev) => [...prev, data.photo]);
        setUploadFile(null);
        setCaption("");
        setMessage("Memory portrait uploaded successfully!");
      } else {
        setMessage(data.message || "Failed to upload photo.");
      }
    } catch {
      setMessage("Network error during photo upload.");
    } finally {
      setIsUploading(false);
    }
  };

  if (fetchError) {
    return (
      <main className="min-h-screen w-full bg-diwali-night text-diwali-ivory p-8 flex items-center justify-center">
        <GlassCard glow className="p-8 max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-diwali-gold">Unable to Load Student</h2>
          <p className="text-xs text-diwali-muted">{fetchError}</p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-diwali-gold text-diwali-night font-bold text-xs uppercase tracking-wider shadow-glow-gold hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Creator Console</span>
            </Link>
          </div>
        </GlassCard>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="min-h-screen w-full bg-diwali-night text-diwali-ivory p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-diwali-gold animate-pulse">Loading student profile...</p>
          <p className="text-[11px] text-diwali-muted">Connecting to secure student records</p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-diwali-muted hover:text-diwali-gold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & return to console</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-diwali-night via-diwali-navy to-diwali-night text-diwali-ivory p-4 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-diwali-muted hover:text-diwali-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Creator Console</span>
          </Link>

          <button
            type="button"
            onClick={handlePreviewExperience}
            disabled={isPreviewing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-diwali-gold bg-diwali-gold/15 border border-diwali-gold/40 hover:bg-diwali-gold/30 hover:scale-105 active:scale-95 transition-all shadow-glow-gold disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPreviewing ? "Launching..." : "Preview Experience as Student"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-diwali-card border border-diwali-gold/40 text-xs text-diwali-gold text-center animate-fade-in shadow-glow-gold">
            {message}
          </div>
        )}

        {/* Details Form Card */}
        <GlassCard glow className="p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-diwali-gold font-bold">
                {student.rollNumber}
              </span>
              <h1 className="text-2xl font-bold text-diwali-ivory mt-0.5">
                {student.displayName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-diwali-muted">Status:</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-green-950/80 text-green-300 border border-green-500/40"
                    : "bg-red-950/80 text-red-300 border border-red-500/40"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Display Name (Greeting Title)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory focus:outline-none focus:border-diwali-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Welcome Headline / Greeting
              </label>
              <textarea
                rows={2}
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory focus:outline-none focus:border-diwali-gold resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold">
                Secret Message (Parchment & Gift Box)
              </label>
              <textarea
                rows={3}
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/40 border border-diwali-border rounded-xl text-sm text-diwali-ivory focus:outline-none focus:border-diwali-gold resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <DiwaliButton type="submit" size="sm" isLoading={isSaving}>
                <span className="inline-flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </span>
              </DiwaliButton>
            </div>
          </form>
        </GlassCard>

        {/* Assigned Photos Management */}
        <GlassCard className="p-8">
          <div className="mb-6 pb-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-diwali-ivory uppercase tracking-wider">
              Assigned Memory Portraits ({photos.length})
            </h2>
            <p className="text-xs text-diwali-muted mt-1">
              Upload 3–5 photographs. The signature fireworks engine cycles through these in sequential order.
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUploadPhoto} className="mb-8 p-4 rounded-xl bg-black/30 border border-diwali-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold mb-1.5">
                  Select Photograph (JPG, PNG, WebP)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="text-xs text-diwali-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-diwali-gold file:text-diwali-night hover:file:bg-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold mb-1.5">
                  Memory Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Diwali Attire"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/50 border border-diwali-border rounded-lg text-xs text-diwali-ivory focus:outline-none focus:border-diwali-gold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <DiwaliButton type="submit" size="sm" isLoading={isUploading} disabled={!uploadFile}>
                <span className="inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload To Private Store</span>
                </span>
              </DiwaliButton>
            </div>
          </form>

          {/* Photo List Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-8 text-xs text-diwali-muted border border-dashed border-white/10 rounded-xl">
              No private photos uploaded yet. Upload 3–5 photographs to build this student's particle portrait sequence.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((p, idx) => (
                <div key={p.id} className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 p-2 space-y-2">
                  <div className="w-full h-36 bg-stone-900 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={`/api/media/student-photo/${p.id}`}
                      alt={p.caption || "Student memory"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-diwali-gold font-medium truncate">
                    #{idx + 1} {p.caption || "Memory"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  );
}

