// app/api/auth/spotify/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("https://beat-track.netlify.app");

  // usuwamy cookie z tokenem
  res.cookies.set("spotify_access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // <- ważne
  });

  return res;
}
