let cachedToken: string | null = null;
let expiresAt = 0;

export async function getSpotifyToken() {
  const now = Date.now();

  if (cachedToken && now < expiresAt) {
    return cachedToken;
  }

  const res = await fetch("/api/auth/spotify/token");
  const data = await res.json();

  cachedToken = data.token;
  expiresAt = now + 55 * 60 * 1000; // 55 min cache

  return cachedToken;
}
