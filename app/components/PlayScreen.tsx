"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ pobranie audio
  useEffect(() => {
    fetch(`/api/card/${cardId}/play`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(({ previewUrl }) => setSrc(previewUrl))
      .catch(() => setError("Błąd ładowania audio"));
  }, [cardId]);

  // 2️⃣ AUTO-PLAY po ustawieniu src
  useEffect(() => {
    if (!src) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        // fallback – rzadko, ale możliwe
        setError("Nie można odtworzyć utworu");
      });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
      {/* ERROR */}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* VINYL / LOADING */}
      {!error && (
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div
            className={`h-full w-full rounded-full border-8 border-zinc-700 ${
              playing ? "animate-spin" : "opacity-40"
            }`}
          />
          <div className="absolute h-4 w-4 rounded-full bg-zinc-500" />
        </div>
      )}

      {/* NEXT */}
      {playing && (
        <button
          onClick={onNext}
          className="mt-10 text-sm opacity-60 transition hover:opacity-100"
        >
          Następny utwór
        </button>
      )}

      {/* AUDIO MUSI BYĆ W DOM */}
      <audio ref={audioRef} src={src ?? undefined} preload="auto" />
    </div>
  );
}
