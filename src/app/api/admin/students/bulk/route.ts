import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const bulkStudentsSchema = z.object({
  students: z.array(
    z.object({
      rollNumber: z.string().min(1).max(64),
      displayName: z.string().min(1).max(128),
      password: z.string().min(1).max(128),
      greetingMessage: z.string().optional(),
      secretMessage: z.string().optional(),
    })
  ).min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bulkStudentsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid CSV payload structure.", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { students } = parsed.data;
    let inserted = 0;
    let skipped = 0;

    if (db) {
      for (const item of students) {
        const rollNumber = item.rollNumber.trim().toUpperCase();
        const displayName = item.displayName.trim();
        const plainPassword = item.password.trim();

        if (!rollNumber || !displayName || !plainPassword) {
          skipped++;
          continue;
        }

        const hashedPassword = await hashPassword(plainPassword);

        try {
          const result = await db
            .insert(schema.students)
            .values({
              rollNumber,
              displayName,
              passwordHash: hashedPassword,
              greetingMessage: item.greetingMessage?.trim() || null,
              secretMessage: item.secretMessage?.trim() || null,
              isActive: true,
            })
            .onConflictDoNothing()
            .returning();

          if (result.length > 0) {
            inserted++;
            await db.insert(schema.studentSettings).values({
              studentId: result[0].id,
            });
          } else {
            skipped++;
          }
        } catch {
          skipped++;
        }
      }

      // Record bulk creation audit event
      await db.insert(schema.adminAuditLog).values({
        adminId: session.userId,
        action: "BULK_CREATE_STUDENTS",
        targetType: "STUDENT_BATCH",
        metadata: { attempted: students.length, inserted, skipped },
      });

      return NextResponse.json({
        success: true,
        inserted,
        skipped,
        total: students.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Bulk students processed in dev mode.",
      inserted: students.length,
      skipped: 0,
      total: students.length,
    });
  } catch (err) {
    console.error("Bulk students import error:", err);
    return NextResponse.json({ message: "Failed to process bulk student batch." }, { status: 500 });
  }
}
