import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const studentLoginSchema = z.object({
  rollNumber: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(`student-login:${ip}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: "Too many login attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    // 2. Validate payload
    const body = await req.json();
    const parsed = studentLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Those details do not match. Please try again." },
        { status: 400 }
      );
    }

    const normalizedRollNumber = parsed.data.rollNumber.trim().toUpperCase();
    const plainPassword = parsed.data.password.trim();

    let studentRecord = null;

    if (db) {
      const records = await db
        .select()
        .from(schema.students)
        .where(eq(schema.students.rollNumber, normalizedRollNumber))
        .limit(1);

      if (records.length > 0) {
        studentRecord = records[0];
      }
    } else {
      // Development bootstrap fallback if database is not yet provisioned
      if (normalizedRollNumber === "21BCE1001" && plainPassword === "15082003") {
        studentRecord = {
          id: "11111111-1111-1111-1111-111111111111",
          rollNumber: "21BCE1001",
          displayName: "Aarav Sharma",
          passwordHash: await hashPassword("15082003"),
          greetingMessage: "May the divine warmth of Diwali fill your heart with light!",
          secretMessage: "Your journey this year has been truly inspiring. Shine bright!",
          isActive: true,
          mustChangePassword: false,
        };
      }
    }

    // Generic error if student not found or inactive
    if (!studentRecord || !studentRecord.isActive) {
      return NextResponse.json(
        { message: "Those details do not match. Please try again." },
        { status: 401 }
      );
    }

    // 3. Verify Argon2id password hash
    const isValidPassword = await verifyPassword(plainPassword, studentRecord.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Those details do not match. Please try again." },
        { status: 401 }
      );
    }

    // 4. Create encrypted HTTP-only session
    await createSession({
      userId: studentRecord.id,
      role: "STUDENT",
      displayName: studentRecord.displayName,
      rollNumber: studentRecord.rollNumber,
    });

    return NextResponse.json({
      success: true,
      displayName: studentRecord.displayName,
    });
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { message: "Unable to process login. Please try again." },
      { status: 500 }
    );
  }
}
