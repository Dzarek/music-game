"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";

type Props = {
  cardId: string;
  onNext: () => void;
};

export default function SpotifyPlayer({ cardId, onNext }: Props) {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const spotifyTrackIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const video = "/video2.mp4";

  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        // token
        const tokenRes = await fetch("/api/auth/spotify/token");
        const tokenData = await tokenRes.json();
        const token = tokenData?.token;
        if (!token) throw new Error("no token");
        tokenRef.current = token;

        // card
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error("no card");
        const { spotifyTrackId } = await res.json();
        if (!spotifyTrackId) throw new Error("no spotifyTrackId");
        spotifyTrackIdRef.current = spotifyTrackId;

        // transfer playback
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [],
            play: false,
          }),
        });

        // play
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [`spotify:track:${spotifyTrackId}`],
          }),
        });

        if (destroyed) return;

        // video
        videoRef.current?.play().catch(() => {});
        setPlaying(true);
        setLoading(false);
      } catch {
        if (!destroyed) {
          setError("Błąd uruchamiania Spotify");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
    };
  }, [cardId]);

  async function togglePlay() {
    const token = tokenRef.current;
    if (!token) return;

    try {
      if (playing) {
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        videoRef.current?.pause();
      } else {
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        videoRef.current?.play().catch(() => {});
      }

      setPlaying((p) => !p);
    } catch {}
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
              loop
              preload="auto"
              playsInline
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
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}
