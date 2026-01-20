import { NextResponse } from "next/server";
import songs from "@/data/songs.json";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cardId = Number(id);

  const song = songs.find((s) => s.cardId === cardId);

  if (!song) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const res = await fetch(`https://api.deezer.com/track/${song.deezerTrackId}`);
  const data = await res.json();

  return NextResponse.json({
    previewUrl: data.preview,
  });
}
