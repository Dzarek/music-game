import { NextResponse } from "next/server";
import songs from "@/data/songs.json";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cardId = Number(params.id);
  const song = songs.find((s) => s.cardId === cardId);

  if (!song) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    title: song.title,
    artist: song.artist,
    year: song.year,
  });
}
