import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateStudentSchema = z.object({
  displayName: z.string().min(1).max(128).optional(),
  greetingMessage: z.string().optional(),
  secretMessage: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  if (db) {
    const records = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, id))
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    const photos = await db
      .select()
      .from(schema.studentPhotos)
      .where(eq(schema.studentPhotos.studentId, id))
      .orderBy(schema.studentPhotos.displayOrder);

    return NextResponse.json({ student: records[0], photos });
  }

  return NextResponse.json({
    student: {
      id,
      rollNumber: "21BCE1001",
      displayName: "Aarav Sharma",
      greetingMessage: "May the divine warmth of Diwali fill your heart with light!",
      secretMessage: "Your journey this year has been truly inspiring. Shine bright!",
      isActive: true,
    },
    photos: [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  if (db) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName;
    if (parsed.data.greetingMessage !== undefined) updateData.greetingMessage = parsed.data.greetingMessage;
    if (parsed.data.secretMessage !== undefined) updateData.secretMessage = parsed.data.secretMessage;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

    await db.update(schema.students).set(updateData).where(eq(schema.students.id, id));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true, message: "Updated in dev mode." });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  if (db) {
    await db.delete(schema.students).where(eq(schema.students.id, id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true, message: "Deleted in dev mode." });
}
