import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SCOPE =
  "user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state";

export async function GET() {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", REDIRECT_URI!);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("show_dialog", "true");
  return NextResponse.redirect(url.toString());
}
