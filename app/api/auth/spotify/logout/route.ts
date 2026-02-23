// app/api/auth/spotify/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("https://beat-track.netlify.app");

  res.cookies.set("spotify_access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  res.cookies.set("spotify_logged_in", "", {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return res;
}
