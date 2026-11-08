import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { head } from "@vercel/blob";
import fs from "node:fs";
import path from "node:path";

function getFallbackImageResponse() {
  try {
    const fallbackPath = path.join(process.cwd(), "public", "test-portraits", "sample-portrait-1.jpg");
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (err) {
    console.warn("Fallback image read error:", err);
  }

  // 1x1 neutral GIF fallback so <img src> never shows a broken icon
  const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const session = await getSession();
    const isSameOrigin =
      req.headers.get("sec-fetch-site") === "same-origin" ||
      req.headers.get("referer")?.includes(req.nextUrl.host);

    if (!session && !isSameOrigin) {
      return getFallbackImageResponse();
    }

    const { photoId } = await params;
    if (!photoId) {
      return getFallbackImageResponse();
    }

    if (db) {
      // 1. Resolve photo metadata
      const records = await db
        .select()
        .from(schema.studentPhotos)
        .where(eq(schema.studentPhotos.id, photoId))
        .limit(1);

      if (records.length === 0) {
        return getFallbackImageResponse();
      }

      const photo = records[0];

      // 2. Ownership verification: student can only fetch their own photo
      if (session && session.role === "STUDENT" && photo.studentId !== session.userId) {
        return getFallbackImageResponse();
      }

      // Case A: Data URI (base64 stored in database)
      if (photo.blobPathname.startsWith("data:")) {
        const commaIdx = photo.blobPathname.indexOf(",");
        const base64Data = photo.blobPathname.slice(commaIdx + 1);
        const imageBuffer = Buffer.from(base64Data, "base64");
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": photo.contentType || "image/jpeg",
            "Cache-Control": "private, max-age=86400",
          },
        });
      }

      // Case B: Direct URL (Vercel Blob download URL)
      if (photo.blobPathname.startsWith("http://") || photo.blobPathname.startsWith("https://")) {
        try {
          const res = await fetch(photo.blobPathname);
          if (res.ok) {
            const buffer = await res.arrayBuffer();
            return new NextResponse(buffer, {
              headers: {
                "Content-Type": photo.contentType || "image/jpeg",
                "Cache-Control": "private, max-age=86400",
              },
            });
          }
        } catch {
          // Fall through to fallback
        }
      }

      // Case C: Vercel Blob private pathname with token
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blobDetails = await head(photo.blobPathname, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });

          const downloadUrl = blobDetails?.downloadUrl || blobDetails?.url;
          if (downloadUrl) {
            const res = await fetch(downloadUrl);
            if (res.ok) {
              const buffer = await res.arrayBuffer();
              return new NextResponse(buffer, {
                headers: {
                  "Content-Type": photo.contentType || "image/jpeg",
                  "Cache-Control": "private, max-age=86400",
                },
              });
            }
          }
        } catch (blobErr) {
          console.warn("Vercel blob lookup error:", blobErr);
        }
      }
    }

    // Safe fallback image for broken or development photos so the browser never shows a broken icon
    return getFallbackImageResponse();
  } catch (error) {
    console.error("Private media streaming error:", error);
    return getFallbackImageResponse();
  }
}
