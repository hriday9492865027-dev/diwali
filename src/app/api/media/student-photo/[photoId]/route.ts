import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { head } from "@vercel/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { photoId } = await params;
    if (!photoId) {
      return NextResponse.json({ message: "Invalid photo identifier." }, { status: 400 });
    }

    if (db) {
      // 1. Resolve photo metadata
      const records = await db
        .select()
        .from(schema.studentPhotos)
        .where(eq(schema.studentPhotos.id, photoId))
        .limit(1);

      if (records.length === 0) {
        return NextResponse.redirect(new URL("/test-portraits/sample-portrait-1.jpg", req.url));
      }

      const photo = records[0];

      // 2. Ownership verification: student can only fetch their own photo
      if (session.role === "STUDENT" && photo.studentId !== session.userId) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
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
    return NextResponse.redirect(new URL("/test-portraits/sample-portrait-1.jpg", req.url));
  } catch (error) {
    console.error("Private media streaming error:", error);
    return NextResponse.redirect(new URL("/test-portraits/sample-portrait-1.jpg", req.url));
  }
}
