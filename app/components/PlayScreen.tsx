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
    async function load() {
      try {
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error();

        const { previewUrl } = await res.json();
        // tylko przypisujemy, nie odtwarzamy
        audioRef.current = new Audio(previewUrl);
        setLoading(false);
      } catch {
        setError("Błąd odtwarzania");
        setLoading(false);
      }
    }

    load();
  }, [cardId]);

  function handlePlay() {
    if (!audioRef.current) return;

    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć"));
  }

  return (
    <Screen>
      {loading && <p>🎵 Ładowanie…</p>}
      {!loading && !playing && !error && (
        <button
          onClick={() => {
            if (!audioRef.current) return;
            audioRef.current
              .play()
              .then(() => setPlaying(true))
              .catch((err) => setError("Nie można odtworzyć: " + err));
          }}
          style={{ fontSize: 24, padding: "16px 32px" }}
        >
          ▶ PLAY
        </button>
      )}

      {error && <p>{error}</p>}

      {playing && (
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
