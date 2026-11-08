import http from 'http';
import { spawn } from 'child_process';

const PORT = 3001;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('--- Starting Next.js Production Server for Smoke Testing ---');
  const server = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', String(PORT)], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
  });

  server.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`[server:err] ${d}`));

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await delay(1000);
    try {
      const res = await request('/');
      if (res.statusCode === 200) {
        ready = true;
        console.log('Server is responding on port ' + PORT);
        break;
      }
    } catch (err) {
      if (i === 10) console.log('Poll attempt error:', err.message);
    }
  }

  if (!ready) {
    server.kill();
    console.error('Server failed to start in 30 seconds');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  try {
    // 1. Landing Page
    await test('Landing Page returns 200 and Diwali branding', async () => {
      const res = await request('/');
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      if (!res.body.includes('DEEPAVALI')) throw new Error('Missing DEEPAVALI branding');
    });

    // 2. Student Login Page
    await test('Student Login Page returns 200', async () => {
      const res = await request('/login');
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      if (!res.body.includes('Roll Number') && !res.body.includes('rollNumber')) {
        throw new Error('Missing login fields');
      }
    });

    // 3. Student Login API (mock/fallback when DB not connected)
    let studentCookie = '';
    await test('Student Login API validates credentials and returns session cookie', async () => {
      const body = JSON.stringify({ rollNumber: '21BCE1001', password: '15082003' });
      const res = await request('/api/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        body,
      });
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}: ${res.body}`);
      const setCookie = res.headers['set-cookie'];
      if (!setCookie || !setCookie.some(c => c.includes('deepavali_session='))) {
        throw new Error('Did not set deepavali_session cookie');
      }
      studentCookie = setCookie.find(c => c.includes('deepavali_session=')).split(';')[0];
    });

    // 4. Authenticated Student Me API
    await test('Student /api/student/me returns profile with valid cookie', async () => {
      const res = await request('/api/student/me', {
        headers: { Cookie: studentCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}: ${res.body}`);
      const data = JSON.parse(res.body);
      if (data.rollNumber !== '21BCE1001') {
        throw new Error(`Unexpected student profile: ${res.body}`);
      }
    });

    // 5. Protected/Client Pages
    const pages = [
      '/welcome',
      '/dashboard',
      '/activities/portrait',
      '/activities/diya',
      '/activities/gift',
      '/activities/secret-message',
      '/activities/memory-wall',
      '/activities/lanterns',
      '/activities/rangoli',
      '/activities/finale',
      '/admin/login',
      '/admin/students/new',
    ];

    for (const page of pages) {
      await test(`Route ${page} loads successfully (HTTP 200)`, async () => {
        const res = await request(page, {
          headers: studentCookie ? { Cookie: studentCookie } : {},
        });
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
      });
    }

    // 6. Admin Login API
    let adminCookie = '';
    await test('Admin Login API authenticates and returns admin session', async () => {
      const body = JSON.stringify({ username: 'admin', password: 'DiwaliAdmin2026!Master' });
      const res = await request('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        body,
      });
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}: ${res.body}`);
      const setCookie = res.headers['set-cookie'];
      if (!setCookie || !setCookie.some(c => c.includes('deepavali_session='))) {
        throw new Error('Did not set deepavali_session cookie');
      }
      adminCookie = setCookie.find(c => c.includes('deepavali_session=')).split(';')[0];
    });

    // 7. Protected Admin Page with Admin Session
    await test('Route /admin loads successfully with admin cookie (HTTP 200)', async () => {
      const res = await request('/admin', {
        headers: { Cookie: adminCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    });

    // 8. Admin Student List API
    await test('Admin /api/admin/students returns student list', async () => {
      const res = await request('/api/admin/students', {
        headers: { Cookie: adminCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}: ${res.body}`);
      const data = JSON.parse(res.body);
      if (!Array.isArray(data)) throw new Error('Expected students array: ' + res.body);
    });

    console.log(`\nSmoke Test Results: ${passed} passed, ${failed} failed`);
  } finally {
    server.kill();
    // Allow process to terminate cleanly
    await delay(1000);
    process.exit(failed > 0 ? 1 : 0);
  }
}

run().catch((err) => {
  console.error('Fatal error during smoke test:', err);
  process.exit(1);
});
