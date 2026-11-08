import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

const adminLoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(`admin-login:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { message: "Too many login attempts. Please wait 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 400 }
      );
    }

    const cleanUsername = parsed.data.username.trim();
    const plainPassword = parsed.data.password;

    let adminRecord = null;

    if (db) {
      const records = await db
        .select()
        .from(schema.administrators)
        .where(eq(schema.administrators.username, cleanUsername))
        .limit(1);

      if (records.length > 0) {
        adminRecord = records[0];
      }
    }

    // Bootstrap fallback admin if database not yet migrated
    const defaultAdminUser = process.env.ADMIN_INITIAL_USERNAME || "admin";
    const defaultAdminPass = process.env.ADMIN_INITIAL_PASSWORD || "DiwaliAdmin2026!Master";

    if (!adminRecord && cleanUsername === defaultAdminUser) {
      adminRecord = {
        id: "00000000-0000-0000-0000-000000000000",
        username: defaultAdminUser,
        passwordHash: await hashPassword(defaultAdminPass),
        isActive: true,
      };
    }

    if (!adminRecord || !adminRecord.isActive) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await verifyPassword(plainPassword, adminRecord.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    await createSession({
      userId: adminRecord.id,
      role: "ADMIN",
      displayName: "Administrator",
      username: adminRecord.username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "Authentication failure." }, { status: 500 });
  }
}

