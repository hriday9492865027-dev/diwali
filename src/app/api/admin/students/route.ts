import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import { eq } from "drizzle-orm";

const createStudentSchema = z.object({
  rollNumber: z.string().min(1).max(64),
  displayName: z.string().min(1).max(128),
  password: z.string().min(6).max(128),
  greetingMessage: z.string().optional(),
  secretMessage: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json([
      {
        id: "11111111-1111-1111-1111-111111111111",
        rollNumber: "21BCE1001",
        displayName: "Aarav Sharma",
        greetingMessage: "May the divine warmth of Diwali fill your heart with light!",
        secretMessage: "Your journey this year has been truly inspiring. Shine bright!",
        isActive: true,
      },
    ]);
  }

  const list = await db.select().from(schema.students);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload.", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const normalizedRollNumber = parsed.data.rollNumber.trim().toUpperCase();
    const hashedPassword = await hashPassword(parsed.data.password.trim());

    if (db) {
      // Check duplicate roll number
      const existing = await db
        .select()
        .from(schema.students)
        .where(eq(schema.students.rollNumber, normalizedRollNumber))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { message: "A student account with this Roll Number already exists." },
          { status: 409 }
        );
      }

      const [newStudent] = await db
        .insert(schema.students)
        .values({
          rollNumber: normalizedRollNumber,
          displayName: parsed.data.displayName.trim(),
          passwordHash: hashedPassword,
          greetingMessage: parsed.data.greetingMessage || null,
          secretMessage: parsed.data.secretMessage || null,
          isActive: true,
        })
        .returning();

      // Create initial settings row
      await db.insert(schema.studentSettings).values({
        studentId: newStudent.id,
      });

      // Audit log
      await db.insert(schema.adminAuditLog).values({
        adminId: session.userId,
        action: "CREATE_STUDENT",
        targetType: "STUDENT",
        targetId: newStudent.id,
        metadata: { rollNumber: normalizedRollNumber, displayName: newStudent.displayName },
      });

      return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
    }

    return NextResponse.json(
      { success: true, message: "Student account created in dev mode." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Student creation error:", error);
    return NextResponse.json({ message: "Failed to create student account." }, { status: 500 });
  }
}
