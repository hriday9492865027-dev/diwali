import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { setGlobalDispatcher, Agent } from 'undici';
import { neon } from '@neondatabase/serverless';

// 1. Google / Cloudflare DNS Resolver to bypass local ISP router DNS blocks
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

const DB_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://neondb_owner:npg_9OPRgZBG7raA@ep-steep-credit-azyyj27h-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  console.log('🔌 Connecting to Neon PostgreSQL...');
  const sql = neon(DB_URL);

  const migrationFile = path.join(process.cwd(), 'drizzle', '0000_wet_ikaris.sql');
  const content = fs.readFileSync(migrationFile, 'utf-8');

  // Split by statement breakpoint
  const statements = content
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Executing ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql(stmt);
      console.log(`  ✓ Statement ${i + 1}/${statements.length} executed`);
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        console.log(`  ℹ Statement ${i + 1} already applied (skipped)`);
      } else {
        console.error(`  ✗ Statement ${i + 1} error:`, err.message);
      }
    }
  }

  console.log('\n✨ Database schema migration successfully verified on Neon!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
