import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const token = cookie
    .split("; ")
    .find((row) => row.startsWith("spotify_access_token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ token: null }, { status: 200 });
  }

  return NextResponse.json({ token }, { status: 200 });
}
