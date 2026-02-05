"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen2({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 🔁 ZMIANA UTWORU (bez unmount)
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/card/${cardId}/play`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(({ previewUrl }) => {
        if (!cancelled) setSrc(previewUrl);
      })
      .catch(() => {
        if (!cancelled) setError("Błąd audio");
      });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  // ▶️ AUTOPLAY
  useEffect(() => {
    if (!src) return;

    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    audio.currentTime = 0;
    video.currentTime = 0;

    Promise.all([audio.play(), video.play()]).catch(() => {});
  }, [src]);

  // 🎧 SYNC
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
  }, []);

  // ⏱ PROGRESS
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (audio.duration) {
        setProgress(1 - audio.currentTime / audio.duration);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", () => setProgress(0));

    return () => {
      audio.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current!;
    audio.paused ? audio.play() : audio.pause();
    setPlaying(!audio.paused);
  };

  return (
    <div className="relative h-full w-full bg-black text-white overflow-hidden">
      {/* VIDEO — ZAWSZE */}
      <video
        ref={videoRef}
        src="/video2.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover brightness-60"
      />

      {/* PLAY / STOP */}
      <button
        onClick={togglePlay}
        className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {playing ? (
          <FaCircleStop className="text-7xl" />
        ) : (
          <FaCirclePlay className="text-7xl" />
        )}
      </button>

      {/* NEXT */}
      <button
        onClick={onNext}
        className="absolute bottom-0 left-0 h-[20%] w-full bg-black flex flex-col items-center justify-center gap-3"
      >
        Następny
        <ImNext className="text-3xl" />
      </button>

      {/* PROGRESS */}
      <div className="absolute bottom-0 left-0 h-[5px] w-full bg-black">
        <div
          className="h-full bg-red-900 transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <audio ref={audioRef} src={src ?? undefined} preload="auto" />
    </div>
  );
}
