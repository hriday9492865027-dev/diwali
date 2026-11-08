import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  let student = null;

  if (db) {
    const records = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, id))
      .limit(1);

    if (records.length > 0) {
      student = records[0];
    }
  } else {
    // Development fallback
    student = {
      id,
      rollNumber: "21BCE1001",
      displayName: "Aarav Sharma",
    };
  }

  if (!student) {
    return NextResponse.json({ message: "Student not found." }, { status: 404 });
  }

  // Create student session on behalf of admin for previewing
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
}
