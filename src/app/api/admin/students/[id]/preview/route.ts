import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

function isUuid(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    let student = null;

    if (db) {
      const condition = isUuid(id)
        ? eq(schema.students.id, id)
        : eq(schema.students.rollNumber, id.toUpperCase());

      const records = await db
        .select()
        .from(schema.students)
        .where(condition)
        .limit(1);

      if (records.length > 0) {
        student = records[0];
      }
    } else {
      student = {
        id,
        rollNumber: "21BCE1001",
        displayName: "Aarav Sharma",
      };
    }

    if (!student) {
      return NextResponse.json({ message: "Student record not found." }, { status: 404 });
    }

    await createSession({
      userId: student.id,
      role: "STUDENT",
      displayName: student.displayName,
      rollNumber: student.rollNumber,
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/welcome",
    });
  } catch (err) {
    console.error("Student preview error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
