"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";
import SpotifyPlayer from "./SpotifyPlayer";

type Props = {
  cardId: string;
  onNext: () => void;
  hasSpotifyPremium: boolean; //
};

export default function PlayScreen({
  cardId,
  onNext,
  hasSpotifyPremium,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState<string | null>(null);
  const [spotifyTrackId, setSpotifyTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0); // Deezer
  const [spotifyProgress, setSpotifyProgress] = useState(0);
  const [spotifyDuration, setSpotifyDuration] = useState(1);

  const video = "/video2.mp4";

  // INIT
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error();
        const { previewUrl, spotifyTrackId } = await res.json();

        if (cancelled) return;

        if (hasSpotifyPremium && spotifyTrackId) {
          setSpotifyTrackId(spotifyTrackId);
          setSrc(null);
        } else {
          setSrc(previewUrl);
          setSpotifyTrackId(null);
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Błąd ładowania audio");
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [cardId, hasSpotifyPremium]);

  // Deezer autoplay
  useEffect(() => {
    if (!src || spotifyTrackId) return;
    const audio = audioRef.current;
    const videoEl = videoRef.current;
    if (!audio || !videoEl) return;

    Promise.all([audio.play(), videoEl.play()])
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć"));
  }, [src, spotifyTrackId]);

  // Spotify video loop
  useEffect(() => {
    if (!spotifyTrackId) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.play().catch(() => {});
    setPlaying(true);
  }, [spotifyTrackId]);

  // Deezer progress
  useEffect(() => {
    if (spotifyTrackId) return;
    const audio = audioRef.current;
    if (!audio) return;

    let rafId: number;
    const tick = () => {
      if (audio.duration) {
        const p = audio.currentTime / audio.duration;
        setProgress(p);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [src, spotifyTrackId]);

  function handleSpotifyState(state: {
    position: number;
    duration: number;
    paused: boolean;
  }) {
    setSpotifyProgress(state.position);
    setSpotifyDuration(state.duration);
    setPlaying(!state.paused);
  }

  function togglePlay() {
    const videoEl = videoRef.current;

    if (spotifyTrackId) {
      if (playing) {
        videoEl?.pause();
      } else {
        videoEl?.play().catch(() => {});
      }
      setPlaying((p) => !p);
      return;
    }

    // Deezer
    const audio = audioRef.current;
    if (!audio || !videoEl) return;

    if (audio.paused) {
      audio.play();
      videoEl.play();
    } else {
      audio.pause();
      videoEl.pause();
    }

    setPlaying((p) => !p);
  }

  const progressPercent = spotifyTrackId
    ? (spotifyProgress / spotifyDuration) * 100
    : progress * 100;

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
              loop={spotifyTrackId !== null}
              className="inset-0 w-full h-full mx-auto object-cover lg:object-contain brightness-60"
            />

            {playing ? (
              <button
                onClick={togglePlay}
                className="absolute rounded-full bg-black z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition text-white"
              >
                <FaCircleStop className="text-7xl" />
              </button>
            ) : (
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
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      ) : (
        <Loading />
      )}

      {/* Deezer */}
      {!spotifyTrackId && (
        <audio ref={audioRef} src={src ?? undefined} preload="auto" />
      )}

      {/* Spotify */}
      {spotifyTrackId && (
        <SpotifyPlayer
          trackId={spotifyTrackId}
          playing={playing}
          onState={handleSpotifyState}
        />
      )}
    </div>
  );
}
