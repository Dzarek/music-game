"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";
import SpotifyPlayer from "./SpotifyPlayer"; // ✅ IMPORT

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState<string | null>(null);
  const [spotifyTrackId, setSpotifyTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(1);

  const video = "/video2.mp4";

  // 🔹 sprawdzanie premium przez API (a nie cookie JS)
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetch("/api/spotify/token")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.token) setIsPremium(true);
      });
  }, []);

  // 1️⃣ pobranie tracków
  useEffect(() => {
    fetch(`/api/card/${cardId}/play`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(({ previewUrl, spotifyTrackId }) => {
        if (isPremium && spotifyTrackId) {
          setSpotifyTrackId(spotifyTrackId); // ✅ Spotify
        } else {
          setSrc(previewUrl); // ✅ Deezer
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Błąd ładowania audio");
        setLoading(false);
      });
  }, [cardId, isPremium]);

  // 2️⃣ Auto-play Deezer
  useEffect(() => {
    if (!src || spotifyTrackId) return;
    const audio = audioRef.current;
    const videoEl = videoRef.current;
    if (!audio || !videoEl) return;

    Promise.all([audio.play(), videoEl.play()])
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć"));
  }, [src, spotifyTrackId]);

  // 3️⃣ progress bar (tylko Deezer)
  useEffect(() => {
    if (spotifyTrackId) return; // ❌ Spotify ma własny timer
    const audio = audioRef.current;
    if (!audio) return;

    let rafId: number;
    const tick = () => {
      if (audio.duration) {
        const p = 1 - audio.currentTime / audio.duration;
        setProgress(p);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [src, spotifyTrackId]);

  function togglePlay() {
    if (spotifyTrackId) {
      // ❌ Spotify sterowane SDK
      return;
    }

    const audio = audioRef.current;
    const videoEl = videoRef.current;
    if (!audio || !videoEl) return;

    if (audio.paused) {
      Promise.all([audio.play(), videoEl.play()]);
    } else {
      audio.pause();
      videoEl.pause();
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="flex relative h-full w-full flex-col bg-black text-white">
      {error && (
        <p className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold uppercase text-center text-red-800">
          {error}
        </p>
      )}

      {!error && !loading ? (
        <>
          <div className="fixed top-0 left-0 lg:left-1/2 lg:-translate-x-1/2 w-full h-[80%] lg:rounded-full lg:w-auto overflow-hidden">
            <video
              ref={videoRef}
              src={video}
              muted
              preload="auto"
              playsInline
              className="inset-0 w-full h-full mx-auto object-cover lg:object-contain brightness-60"
            />

            {!spotifyTrackId && (
              <>
                {playing ? (
                  <button onClick={togglePlay} className="absolute ...">
                    <FaCircleStop className="text-7xl" />
                  </button>
                ) : (
                  <button onClick={togglePlay} className="absolute ...">
                    <FaCirclePlay className="text-7xl" />
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={onNext}
            className="fixed bottom-0 left-0 h-[20%] ..."
          >
            Następny utwór
            <ImNext className="text-4xl" />
          </button>

          {!spotifyTrackId && (
            <div className="fixed z-50 bottom-0 left-0 h-1.25 w-full bg-black overflow-hidden">
              <div
                className="h-full bg-red-800 rounded-r-2xl"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </>
      ) : (
        <Loading />
      )}

      {/* 🔹 Deezer */}
      {!spotifyTrackId && (
        <audio ref={audioRef} src={src ?? undefined} preload="auto" />
      )}

      {/* 🔹 Spotify FULL TRACK */}
      {spotifyTrackId && <SpotifyPlayer trackId={spotifyTrackId} />}
    </div>
  );
}
