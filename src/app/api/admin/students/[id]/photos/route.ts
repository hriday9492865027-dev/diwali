import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";

function isUuid(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const displayOrder = parseInt((formData.get("displayOrder") as string) || "0", 10);

    if (!file) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }

    // Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, or WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate max file size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image size exceeds maximum limit of 10MB." },
        { status: 400 }
      );
    }

    let targetStudentId = id;

    if (db) {
      const condition = isUuid(id)
        ? eq(schema.students.id, id)
        : eq(schema.students.rollNumber, id.toUpperCase());

      const found = await db
        .select({ id: schema.students.id })
        .from(schema.students)
        .where(condition)
        .limit(1);

      if (found.length === 0) {
        return NextResponse.json({ message: "Student record not found." }, { status: 404 });
      }

      targetStudentId = found[0].id;
    }

    let blobPathname = `students/${targetStudentId}/${Date.now()}-${file.name}`;

    // Upload to Vercel Blob if token is set
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blobResult = await put(blobPathname, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      blobPathname = blobResult.pathname;
    }

    if (db) {
      const [photo] = await db
        .insert(schema.studentPhotos)
        .values({
          studentId: targetStudentId,
          blobPathname,
          contentType: file.type,
          sizeBytes: file.size,
          caption: caption || null,
          displayOrder,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ success: true, photo }, { status: 201 });
    }

    return NextResponse.json(
      {
        success: true,
        photo: {
          id: `dev-photo-${Date.now()}`,
          blobPathname,
          caption,
          displayOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ message: "Failed to upload photo." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json({ message: "photoId is required." }, { status: 400 });
    }

    if (db) {
      const records = await db
        .select()
        .from(schema.studentPhotos)
        .where(eq(schema.studentPhotos.id, photoId))
        .limit(1);

      if (records.length > 0) {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          try {
            await del(records[0].blobPathname, {
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
          } catch {
            // Best-effort blob deletion
          }
        }

        await db.insert(schema.adminAuditLog).values({
          adminId: session.userId,
          action: "DELETE_STUDENT_PHOTO",
          targetType: "STUDENT_PHOTO",
          targetId: photoId,
          metadata: { studentId: records[0].studentId, pathname: records[0].blobPathname },
        });
      }

      await db.delete(schema.studentPhotos).where(eq(schema.studentPhotos.id, photoId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Deleted in dev mode." });
  } catch (err) {
    console.error("Delete photo error:", err);
    return NextResponse.json({ message: "Failed to delete photo." }, { status: 500 });
  }
}
