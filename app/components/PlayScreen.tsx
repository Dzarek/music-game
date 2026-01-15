"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    async function loadAndPlay() {
      try {
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error("Nie można odtworzyć");

        const { previewUrl } = await res.json();

        audioRef.current = new Audio(previewUrl);
        audioRef.current.play();
        setPlaying(true);
        setLoading(false);
      } catch (e) {
        setError("Błąd odtwarzania");
        setLoading(false);
      }
    }

    loadAndPlay();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [cardId]);

  return (
    <Screen>
      {loading && <p>🎵 Ładowanie…</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <Vinyl spinning={playing} />

          <button
            onClick={onNext}
            style={{
              marginTop: 48,
              opacity: 0.7,
              fontSize: 16,
            }}
          >
            Następny utwór
          </button>
        </>
      )}
    </Screen>
  );
}

function Vinyl({ spinning }: { spinning: boolean }) {
  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: "50%",
        border: "8px solid #444",
        animation: spinning ? "spin 2s linear infinite" : "none",
      }}
    />
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {children}
    </div>
  );
}
