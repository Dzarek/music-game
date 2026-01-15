import { NextResponse } from "next/server";
import songs from "@/data/songs.json";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cardId = Number(id);

  if (Number.isNaN(cardId)) {
    return NextResponse.json({ error: "Invalid card id" }, { status: 400 });
  }

  const song = songs.find((s) => s.cardId === cardId);

  if (!song) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (!song.previewUrl) {
    return NextResponse.json(
      { error: "Preview not available" },
      { status: 404 }
    );
  }

  // 🔒 ZERO SPOILERÓW
  return NextResponse.json({
    previewUrl: song.previewUrl,
  });
}
