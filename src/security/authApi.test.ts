import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { signInWithPassword, getAuthenticatedUser } from "./authApi.ts";

const config = { url: "https://example.supabase.co", publishableKey: "sb_publishable_test" };
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("credentials go in POST body, never URL", async () => {
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;
  globalThis.fetch = async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(JSON.stringify({
      access_token: "token", refresh_token: "refresh", expires_in: 3600,
      user: { id: "user-1" },
    }), { status: 200 });
  };
  await signInWithPassword(config, "person@example.com", "password");
  assert.equal(capturedInit?.method, "POST");
  assert.equal(capturedUrl.includes("password"), false);
  assert.equal(JSON.parse(String(capturedInit?.body)).email, "person@example.com");
});

test("rejects invalid credentials", async () => {
  globalThis.fetch = async () => new Response("", { status: 401 });
  await assert.rejects(signInWithPassword(config, "person@example.com", "bad"));
});

test("fetches authenticated identity from server", async () => {
  let authHeader = "";
  globalThis.fetch = async (_url, init) => {
    authHeader = new Headers(init?.headers).get("Authorization") || "";
    return new Response(JSON.stringify({ id: "user-1" }), { status: 200 });
  };
  const user = await getAuthenticatedUser(config, "token");
  assert.equal(user.id, "user-1");
  assert.equal(authHeader, "Bearer token");
});
