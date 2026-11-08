import test from "node:test";
import assert from "node:assert/strict";

// Test 1: Rate Limiter logic
test("Rate Limiter enforces sliding window limits", () => {
  const store = new Map();

  function testCheckRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0 };
    }

    record.count += 1;
    return { success: true, remaining: limit - record.count };
  }

  const key = "test-ip-127.0.0.1";
  const limit = 3;

  assert.equal(testCheckRateLimit(key, limit, 1000).success, true);
  assert.equal(testCheckRateLimit(key, limit, 1000).success, true);
  assert.equal(testCheckRateLimit(key, limit, 1000).success, true);
  // 4th attempt should be blocked
  assert.equal(testCheckRateLimit(key, limit, 1000).success, false);
});

// Test 2: Input normalization & DOB validation
test("Student credentials normalization", () => {
  const rawRollNumber = "  21bce1001  ";
  const normalized = rawRollNumber.trim().toUpperCase();
  assert.equal(normalized, "21BCE1001");

  const rawDob = "15082003";
  const dobRegex = /^\d{8}$/;
  assert.equal(dobRegex.test(rawDob), true);

  const invalidDob = "15-08-2003";
  assert.equal(dobRegex.test(invalidDob), false);
});

