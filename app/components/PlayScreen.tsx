"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";

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

  // Sprawdź czy użytkownik zalogowany do Spotify Premium
  const isPremium = document.cookie.includes("spotify_access_token=");

  // 1️⃣ pobranie audio
  useEffect(() => {
    fetch(`/api/card/${cardId}/play`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(({ previewUrl, spotifyTrackId }) => {
        if (isPremium && spotifyTrackId) {
          setSpotifyTrackId(spotifyTrackId);
        } else {
          setSrc(previewUrl);
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
    if (!src || spotifyTrackId) return; // pomiń jeśli Spotify
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    Promise.all([audio.play(), video.play()])
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć"));
  }, [src, spotifyTrackId]);

  // 3️⃣ Odtwarzanie Spotify Premium
  useEffect(() => {
    if (!spotifyTrackId) return;
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("spotify_access_token="))
      ?.split("=")[1];
    if (!token) return;

    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      body: JSON.stringify({ uris: [`spotify:track:${spotifyTrackId}`] }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć Spotify"));
  }, [spotifyTrackId]);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    const onPlay = () => {
      setPlaying(true);
      video.play().catch(() => {});
    };

    const onPause = () => {
      setPlaying(false);
      video.pause();
    };

    const onEnded = () => {
      setPlaying(false);
      video.pause();
      video.currentTime = 0;
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playing]);

  useEffect(() => {
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
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    if (audio.paused && !spotifyTrackId) {
      Promise.all([audio.play(), video.play()]).catch(() =>
        setError("Nie można odtworzyć utworu"),
      );
    } else {
      audio.pause();
      video.pause();
      if (spotifyTrackId) {
        setError("Sterowanie Spotify wymaga SDK lub Web Playback API");
      }
    }
    setPlaying((prev) => !prev);
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
            {playing && (
              <button
                onClick={togglePlay}
                className="absolute rounded-full bg-black z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition text-white"
              >
                <FaCircleStop className="text-7xl" />
              </button>
            )}
            {!playing && (
              <button
                onClick={togglePlay}
                className="absolute rounded-full bg-black z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition text-white"
              >
                <FaCirclePlay className="text-7xl" />
              </button>
            )}
          </div>
          <button
            onClick={onNext}
            className="fixed bottom-0 left-0 h-[20%] text-xl uppercase cairo font-bold py-8 px-4 w-full bg-black text-white transition hover:opacity-100 flex flex-col justify-center items-center gap-y-4 opacity-85"
          >
            Następny utwór
            <ImNext className="text-4xl" />
          </button>
          <div className="fixed z-50 bottom-0 left-0 h-1.25 w-full bg-black overflow-hidden">
            <div
              className="h-full bg-red-800 rounded-r-2xl"
              style={{ width: `${progress * 100}%`, willChange: "width" }}
            />
          </div>
        </>
      ) : (
        <Loading />
      )}
      {/* AUDIO MUSI BYĆ W DOM jeśli Deezer */}
      {!spotifyTrackId && (
        <audio ref={audioRef} src={src ?? undefined} preload="auto" />
      )}
    </div>
  );
}
