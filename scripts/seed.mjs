import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean, uuid, integer } from 'drizzle-orm/pg-core';
import { hashPassword } from '../src/lib/auth/password.ts';

const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  rollNumber: text("roll_number").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  greetingMessage: text("greeting_message"),
  secretMessage: text("secret_message"),
  isActive: boolean("is_active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const administrators = pgTable("administrators", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const studentPhotos = pgTable("student_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull(),
  blobUrl: text("blob_url").notNull(),
  blobPathname: text("blob_pathname").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.log('To seed your database, run:');
    console.log('  $env:DATABASE_URL="postgresql://..." ; npm run seed');
    process.exit(1);
  }

  console.log('🔌 Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);
  const db = drizzle(sql);

  console.log('🌱 Seeding initial administrator account...');
  const defaultAdminUser = process.env.ADMIN_INITIAL_USERNAME || 'admin';
  const defaultAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'DiwaliAdmin2026!Master';
  const adminHash = await hashPassword(defaultAdminPass);

  await db
    .insert(administrators)
    .values({
      username: defaultAdminUser,
      passwordHash: adminHash,
      isActive: true,
    })
    .onConflictDoNothing();

  console.log(`✓ Admin provisioned: ${defaultAdminUser}`);

  console.log('🌱 Seeding initial batch of celebration students...');
  const sampleStudents = [
    {
      rollNumber: '21BCE1001',
      displayName: 'Aarav Sharma',
      dob: '15082003',
      greetingMessage: 'May the divine light of Diwali illuminate your future with endless success!',
      secretMessage: 'Your leadership and kindness during this academic year have truly inspired everyone around you. Keep shining!',
    },
    {
      rollNumber: '21BCE1002',
      displayName: 'Priya Patel',
      dob: '26012003',
      greetingMessage: 'Wishing you a Diwali full of golden moments, warmth, and boundless creativity!',
      secretMessage: 'Your artistic spirit and dedication bring vibrant energy to our entire department. Never stop dreaming big!',
    },
    {
      rollNumber: '21BCE1003',
      displayName: 'Rohan Verma',
      dob: '02102002',
      greetingMessage: 'May the festival of lights bring abundant prosperity and victory to all your endeavors!',
      secretMessage: 'Your perseverance through the toughest challenges has been phenomenal. You are destined for greatness!',
    },
    {
      rollNumber: '21BCE1004',
      displayName: 'Ananya Iyer',
      dob: '14112003',
      greetingMessage: 'May your year ahead sparkle with immense laughter, joy, and starlight!',
      secretMessage: 'Your cheerful presence always lights up the room, just like a golden Diwali Diya!',
    },
  ];

  for (const s of sampleStudents) {
    const studentHash = await hashPassword(s.dob);
    await db
      .insert(students)
      .values({
        rollNumber: s.rollNumber,
        displayName: s.displayName,
        passwordHash: studentHash,
        greetingMessage: s.greetingMessage,
        secretMessage: s.secretMessage,
        isActive: true,
        mustChangePassword: false,
      })
      .onConflictDoNothing();

    console.log(`✓ Student provisioned: ${s.rollNumber} (${s.displayName})`);
  }

  console.log('\n✨ Database seeding completed successfully!');
}

main().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
