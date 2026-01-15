"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error("API error");

        const { previewUrl } = await res.json();
        setSrc(previewUrl);
        setLoading(false);
      } catch (e) {
        setError("Błąd ładowania audio");
        setLoading(false);
      }
    }

    load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [cardId]);

  function handlePlay() {
    if (!audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setError("Autoplay zablokowany"));
  }

  return (
    <div style={screenStyle}>
      {loading && <p>🎵 Ładowanie…</p>}
      {error && <p>{error}</p>}

      {!loading && !playing && !error && (
        <button onClick={handlePlay} style={playButtonStyle}>
          ▶ PLAY
        </button>
      )}

      {playing && <Vinyl />}

      <audio ref={audioRef} src={src ?? undefined} preload="auto" />

      {playing && (
        <button onClick={onNext} style={{ marginTop: 40, opacity: 0.6 }}>
          Następny utwór
        </button>
      )}
    </div>
  );
}

function Vinyl() {
  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: "50%",
        border: "8px solid #444",
        animation: "spin 2s linear infinite",
      }}
    />
  );
}

const screenStyle: React.CSSProperties = {
  height: "100vh",
  width: "100vw",
  background: "#000",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const playButtonStyle: React.CSSProperties = {
  fontSize: 24,
  padding: "16px 32px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
};
