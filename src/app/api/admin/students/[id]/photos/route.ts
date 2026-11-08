import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { put } from "@vercel/blob";

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

    let blobPathname = `students/${id}/${Date.now()}-${file.name}`;

    // Upload to Vercel Blob with private/token access if token is set
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
          studentId: id,
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
