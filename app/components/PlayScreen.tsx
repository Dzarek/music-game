"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function PlayScreen({ cardId, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const video = "/video2.mp4";

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
    const video = videoRef.current;
    if (!audio || !video) return;

    Promise.all([audio.play(), video.play()])
      .then(() => setPlaying(true))
      .catch(() => setError("Nie można odtworzyć"));

    return () => {
      audio.pause();
      audio.currentTime = 0;
      video.pause();
      video.currentTime = 0;
    };
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    if (playing) {
      audio.pause();
      video.pause();
      setPlaying(false);
    } else {
      Promise.all([audio.play(), video.play()])
        .then(() => setPlaying(true))
        .catch(() => setError("Nie można odtworzyć"));
    }
  }

  return (
    <div className="flex relative h-screen w-screen flex-col items-center justify-between bg-black text-white ">
      {/* ERROR */}
      {/* {error && <p className="text-sm text-red-400">{error}</p>} */}

      <div className="relative w-full h-4/5">
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          className="inset-0 w-full h-full mx-auto object-cover brightness-60"
        />

        <button
          onClick={togglePlay}
          className="absolute rounded-full bg-black z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition text-white"
        >
          {playing ? (
            <FaCircleStop className="text-7xl" />
          ) : (
            <FaCirclePlay className="text-7xl" />
          )}
        </button>
      </div>
      <button
        onClick={onNext}
        className="absolute h-1/5 bottom-0 left-1/2 -translate-x-1/2 text-xl uppercase cairo font-bold py-8 px-4 w-full bg-black text-white transition hover:opacity-100 flex flex-col justify-center items-center gap-y-4 opacity-85"
      >
        Następny utwór
        <ImNext className="text-4xl" />
      </button>
      {/* )} */}

      {/* AUDIO MUSI BYĆ W DOM */}
      <audio ref={audioRef} src={src ?? undefined} preload="auto" />
    </div>
  );
}
