"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Sparkles,
  ExternalLink,
  Save,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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

/**
 * Client-side high-efficiency image compressor.
 * Downscales camera photos (like raw DSLR DSC_xxxx.JPG up to 25MB)
 * down to crisp ~250KB JPEG buffers before network transmission.
 * Avoids Vercel 4.5MB serverless payload rejections completely.
 */
async function optimizeImageFile(file: File, maxDimension = 1400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    // If image is already smaller than 350KB, use directly
    if (file.size <= 350 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
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

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  // Actions state
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
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
        setMessageType("error");
        setIsPreviewing(false);
      }
    } catch {
      setMessage("Network error launching student preview.");
      setMessageType("error");
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
      .catch(() => {
        if (isMounted) setFetchError("Network error while connecting to database.");
      });

    return () => {
      isMounted = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [studentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage(null);
    } else {
      setUploadFile(null);
      setPreviewUrl(null);
    }
  };

  const handleClearSelectedFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadFile(null);
    setPreviewUrl(null);
  };

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
        setMessage("Student profile details saved successfully.");
        setMessageType("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || "Failed to update student details.");
        setMessageType("error");
      }
    } catch {
      setMessage("Failed to update student details due to a network error.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setMessage("Please choose a photograph to upload first.");
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    setUploadProgressText("Optimizing image resolution...");
    setMessage(null);

    try {
      // 1. Client-side compression for huge camera photos (e.g. DSC_xxxx.JPG)
      const optimizedBlob = await optimizeImageFile(uploadFile);
      setUploadProgressText("Encrypting & uploading to private store...");

      const safeName = uploadFile.name.replace(/\.[^/.]+$/, ".jpg");
      const uploadPayload = new File([optimizedBlob], safeName, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", uploadPayload);
      formData.append("caption", caption);
      formData.append("displayOrder", String(photos.length));

      const res = await fetch(`/api/admin/students/${studentId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.photo) {
        setPhotos((prev) => [...prev, data.photo]);
        handleClearSelectedFile();
        setCaption("");
        setMessage("Memory portrait uploaded and secured successfully!");
        setMessageType("success");
      } else {
        setMessage(data?.message || "Failed to upload photo. Please try a different image.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Network or server connection error during upload. Please retry.");
      setMessageType("error");
    } finally {
      setIsUploading(false);
      setUploadProgressText(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this memory portrait?")) {
      return;
    }

    setDeletingPhotoId(photoId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/students/${studentId}/photos?photoId=${photoId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setMessage("Memory photo removed from student account.");
        setMessageType("success");
      } else {
        setMessage(data?.message || "Failed to remove photo.");
        setMessageType("error");
      }
    } catch {
      setMessage("Network error while deleting photo.");
      setMessageType("error");
    } finally {
      setDeletingPhotoId(null);
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
          <div
            className={`p-3.5 rounded-xl border text-xs text-center flex items-center justify-center gap-2 animate-fade-in shadow-lg ${
              messageType === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/60 border-red-500/40 text-red-200"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{message}</span>
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
        <GlassCard className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-diwali-ivory uppercase tracking-wider flex items-center gap-2">
                <span>Assigned Memory Portraits</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-diwali-gold/20 text-diwali-gold border border-diwali-gold/40">
                  {photos.length} / 5
                </span>
              </h2>
              <p className="text-xs text-diwali-muted mt-1">
                Upload 3–5 photographs. The signature fireworks engine cycles through these in sequential order.
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUploadPhoto} className="mb-8 p-5 rounded-2xl bg-black/40 border border-diwali-gold/30 shadow-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Picker & Instant Preview */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold mb-2">
                  Select Photograph (JPG, PNG, WebP)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-file-input"
                />

                {!uploadFile ? (
                  <label
                    htmlFor="photo-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-diwali-gold/40 rounded-xl hover:border-diwali-gold hover:bg-diwali-gold/5 transition-all cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 text-diwali-gold group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-diwali-gold uppercase tracking-wider">
                      Choose Photo from Device
                    </span>
                    <span className="text-[10px] text-diwali-muted mt-1">
                      Supports DSLR, Camera roll, JPG, PNG up to 15MB
                    </span>
                  </label>
                ) : (
                  <div className="p-3 rounded-xl bg-black/60 border border-diwali-gold/50 flex items-center gap-3">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Selected preview"
                        className="w-16 h-16 rounded-lg object-cover border border-white/20"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-diwali-ivory truncate">{uploadFile.name}</p>
                      <p className="text-[10px] text-diwali-muted">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="p-1.5 rounded-full bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 transition-colors"
                      title="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Caption & Submit */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-diwali-gold font-semibold mb-2">
                    Memory Caption (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Diwali Attire / Festive Smiles"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-diwali-border rounded-xl text-xs text-diwali-ivory focus:outline-none focus:border-diwali-gold"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {uploadProgressText && (
                    <span className="text-[11px] text-amber-300 font-medium animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadProgressText}</span>
                    </span>
                  )}
                  <div className="ml-auto">
                    <DiwaliButton
                      type="submit"
                      size="sm"
                      isLoading={isUploading}
                      disabled={!uploadFile || isUploading}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload To Private Store</span>
                      </span>
                    </DiwaliButton>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Photo List Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-diwali-muted border border-dashed border-white/10 rounded-2xl space-y-2">
              <ImageIcon className="w-8 h-8 text-diwali-muted mx-auto opacity-50" />
              <p className="font-semibold text-diwali-ivory">No private photos uploaded yet.</p>
              <p>Upload 3–5 photographs to build this student's signature particle portrait sequence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative rounded-2xl overflow-hidden bg-black/50 border border-diwali-gold/20 p-3 space-y-2.5 shadow-lg group hover:border-diwali-gold/50 transition-all"
                >
                  <div className="w-full h-44 bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <img
                      src={`/api/media/student-photo/${p.id}`}
                      alt={p.caption || "Student memory"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/test-portraits/sample-portrait-1.jpg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-diwali-gold/40 text-[10px] text-diwali-gold font-bold">
                      #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(p.id)}
                      disabled={deletingPhotoId === p.id}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-950/90 hover:bg-red-800 text-red-200 border border-red-500/50 shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                      title="Delete this photo"
                    >
                      {deletingPhotoId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-diwali-ivory font-medium truncate">
                      {p.caption || `Memory Portrait #${idx + 1}`}
                    </div>
                    <p className="text-[10px] text-diwali-muted">Secured in private Diwali vault</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p.id)}
                    disabled={deletingPhotoId === p.id}
                    className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 text-red-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {deletingPhotoId === p.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Removing from vault...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Photo</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
