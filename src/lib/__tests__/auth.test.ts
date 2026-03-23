// @vitest-environment node
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { jwtVerify } from "jose";

// Mock server-only so it doesn't throw outside Next.js
vi.mock("server-only", () => ({}));

// Mock next/headers cookies()
const mockCookieSet = vi.fn();
const mockCookieStore = { set: mockCookieSet };
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Import after mocks are set up
const { createSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("createSession sets a cookie named auth-token", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockCookieSet).toHaveBeenCalledOnce();
  const [cookieName] = mockCookieSet.mock.calls[0];
  expect(cookieName).toBe("auth-token");
});

test("createSession sets an httpOnly cookie", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
});

test("createSession sets sameSite lax and path /", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieSet.mock.calls[0];
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets secure=false in non-production", async () => {
  vi.stubEnv("NODE_ENV", "test");

  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieSet.mock.calls[0];
  expect(options.secure).toBe(false);
});

test("createSession sets secure=true in production", async () => {
  vi.stubEnv("NODE_ENV", "production");

  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieSet.mock.calls[0];
  expect(options.secure).toBe(true);
});

test("createSession sets expiry approximately 7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockCookieSet.mock.calls[0];
  const expires: Date = options.expires;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession stores a valid JWT containing userId and email", async () => {
  await createSession("user-42", "test@example.com");

  const [, token] = mockCookieSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("test@example.com");
});

test("createSession JWT expires in 7 days", async () => {
  const before = Math.floor(Date.now() / 1000);
  await createSession("user-1", "user@example.com");
  const after = Math.floor(Date.now() / 1000);

  const [, token] = mockCookieSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  const sevenDaysSec = 7 * 24 * 60 * 60;
  expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDaysSec - 1);
  expect(payload.exp).toBeLessThanOrEqual(after + sevenDaysSec + 1);
});
