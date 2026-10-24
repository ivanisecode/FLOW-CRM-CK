import { describe, expect, it, vi, afterEach } from "vitest";
import { signInWithPassword, getAuthenticatedUser } from "./authApi";

const config = { url: "https://example.supabase.co", publishableKey: "sb_publishable_test" };
afterEach(() => vi.unstubAllGlobals());

describe("Supabase Auth REST adapter", () => {
  it("never sends credentials through query strings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token", refresh_token: "refresh", expires_in: 3600,
        user: { id: "user-1" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await signInWithPassword(config, "person@example.com", "password");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain("password");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).email).toBe("person@example.com");
  });

  it("rejects invalid credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(signInWithPassword(config, "person@example.com", "bad")).rejects.toThrow();
  });

  it("verifies the user with the server rather than trusting local metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ id: "user-1", email: "person@example.com" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = await getAuthenticatedUser(config, "token");
    expect(user.id).toBe("user-1");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
  });
});
