import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  console.log("Spotify code:", code);
  console.log("Client ID:", process.env.SPOTIFY_CLIENT_ID);
  console.log("Client Secret:", process.env.SPOTIFY_CLIENT_SECRET);
  console.log("Redirect URI:", process.env.SPOTIFY_REDIRECT_URI);
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  const data = await tokenRes.json();
  console.log("Token response:", data);
  const res = NextResponse.redirect("https://beat-track.netlify.app"); // <- absolutny URL
  res.cookies.set("spotify_access_token", data.access_token, {
    httpOnly: true,
  });
  return res;
}
