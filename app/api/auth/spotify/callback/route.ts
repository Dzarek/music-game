import { NextResponse } from "next/server";
import qs from "querystring";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

  const body = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  const response = NextResponse.redirect("/");
  response.cookies.set("spotify_access_token", data.access_token, {
    httpOnly: true,
    path: "/",
  });
  response.cookies.set("spotify_refresh_token", data.refresh_token, {
    httpOnly: true,
    path: "/",
  });
  return response;
}
