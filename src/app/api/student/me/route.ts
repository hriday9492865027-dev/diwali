import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();

  if (!session || (session.role !== "STUDENT" && session.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let studentData = {
    displayName: session.displayName,
    rollNumber: session.rollNumber,
    greetingMessage: "May the light of Diwali brighten your path and illuminate your journey ahead!",
    secretMessage: "Your presence brings warmth to this celebration.",
    photos: [] as Array<{ id: string; caption?: string | null; displayOrder: number }>,
  };

  if (db && session.role === "STUDENT") {
    const records = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, session.userId))
      .limit(1);

    if (records.length > 0) {
      const s = records[0];
      studentData.displayName = s.displayName;
      studentData.greetingMessage = s.greetingMessage || studentData.greetingMessage;
      studentData.secretMessage = s.secretMessage || studentData.secretMessage;

      const photos = await db
        .select({
          id: schema.studentPhotos.id,
          caption: schema.studentPhotos.caption,
          displayOrder: schema.studentPhotos.displayOrder,
        })
        .from(schema.studentPhotos)
        .where(eq(schema.studentPhotos.studentId, session.userId))
        .orderBy(schema.studentPhotos.displayOrder);

      studentData.photos = photos;
    }
  }

  return NextResponse.json(studentData);
}

