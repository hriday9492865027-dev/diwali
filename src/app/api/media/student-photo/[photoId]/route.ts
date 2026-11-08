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
        return NextResponse.json({ message: "Photo not found." }, { status: 404 });
      }

      const photo = records[0];

      // 2. Ownership verification: student can only fetch their own photo
      if (session.role === "STUDENT" && photo.studentId !== session.userId) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
      }

      // 3. Fetch from private Vercel Blob using token authorization
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blobDetails = await head(photo.blobPathname, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        if (blobDetails && blobDetails.downloadUrl) {
          const res = await fetch(blobDetails.downloadUrl);
          const buffer = await res.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": photo.contentType || "image/jpeg",
              "Cache-Control": "private, no-store, must-revalidate",
            },
          });
        }
      }
    }

    // Mock fallback for local development when database is not connected
    return NextResponse.json({
      message: "Development media streaming mode.",
      photoId,
    });
  } catch (error) {
    console.error("Private media streaming error:", error);
    return NextResponse.json({ message: "Internal media error." }, { status: 500 });
  }
}
