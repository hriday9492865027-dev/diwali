import dns from 'node:dns';
import { setGlobalDispatcher, Agent } from 'undici';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean, uuid, integer, varchar } from 'drizzle-orm/pg-core';
import { hashPassword } from '../src/lib/auth/password.ts';

// 1. Google DNS Resolver
const resolver = new dns.promises.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

function customLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  resolver.resolve4(hostname).then(
    (addresses) => {
      if (options && options.all) {
        callback(null, addresses.map((addr) => ({ address: addr, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    },
    (err) => {
      dns.lookup(hostname, options, callback);
    }
  );
}

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup: customLookup,
    },
  })
);

const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  rollNumber: varchar("roll_number", { length: 64 }).notNull().unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  greetingMessage: text("greeting_message"),
  secretMessage: text("secret_message"),
  isActive: boolean("is_active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

const administrators = pgTable("administrators", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    "postgresql://neondb_owner:npg_9OPRgZBG7raA@ep-steep-credit-azyyj27h-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

  console.log('🔌 Connecting to Neon PostgreSQL for Seeding...');
  const sql = neon(connectionString);
  const db = drizzle(sql);

  console.log('🌱 Seeding administrator account...');
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

  console.log('\n✨ Database seeding completed successfully on Neon PostgreSQL!');
}

main().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
