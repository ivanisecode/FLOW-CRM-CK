/** Supabase Auth adapter for the future protected app.
 * This module never uses the legacy anonymous data client.
 * It is NOT wired to App.tsx until RLS is ready.
 */
export type AuthUser = { id: string; email?: string };
export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
};

export type AuthConfig = { url: string; publishableKey: string };

function endpoint(config: AuthConfig, path: string) {
  if (!/^https:\/\/[^/]+\.supabase\.co$/.test(config.url)) {
    throw new Error("Invalid Supabase project URL");
  }
  return config.url + "/auth/v1/" + path;
}

export async function signInWithPassword(
  config: AuthConfig,
  email: string,
  password: string,
): Promise<AuthSession> {
  if (!config.publishableKey) throw new Error("Missing publishable key");
  const response = await fetch(endpoint(config, "token?grant_type=password"), {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Authentication failed");
  const session = (await response.json()) as AuthSession;
  if (!session.access_token || !session.user?.id) throw new Error("Invalid auth response");
  return session;
}

export async function getAuthenticatedUser(
  config: AuthConfig,
  accessToken: string,
): Promise<AuthUser> {
  const response = await fetch(endpoint(config, "user"), {
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + accessToken,
    },
  });
  if (!response.ok) throw new Error("Session invalid or expired");
  const user = (await response.json()) as AuthUser;
  if (!user.id) throw new Error("Invalid user response");
  return user;
}

export async function signOut(
  config: AuthConfig,
  accessToken: string,
): Promise<void> {
  const response = await fetch(endpoint(config, "logout"), {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + accessToken,
    },
  });
  if (!response.ok) throw new Error("Could not sign out");
}
