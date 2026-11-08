import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Hash a plaintext password (such as DDMMYYYY DOB) using Argon2id.
 * Never stores or returns plaintext passwords.
 */
export async function hashPassword(plain: string): Promise<string> {
  return await hash(plain, ARGON2_OPTIONS);
}

/**
 * Verify a plaintext password against an Argon2id hash.
 * Constant-time comparison prevents timing attacks.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    return await verify(hashed, plain, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}
