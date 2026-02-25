"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";

type Props = {
  cardId: string;
  onNext: () => void;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Spotify: any;
  }
}

export default function SpotifyPlayer({ cardId, onNext }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const activatedRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const positionRef = useRef(0);
  const durationRef = useRef(1);

  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  const video = "/video2.mp4";

  // INIT
  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        // 1️⃣ token
        const tokenRes = await fetch("/api/auth/spotify/token");
        const tokenData = await tokenRes.json();
        const token = tokenData?.token;
        if (!token) throw new Error("no token");

        // 2️⃣ card data
        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error("no card");
        const { spotifyTrackId } = await res.json();
        if (!spotifyTrackId) throw new Error("no spotifyTrackId");

        // 3️⃣ SDK
        if (!document.getElementById("spotify-sdk")) {
          const script = document.createElement("script");
          script.id = "spotify-sdk";
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          document.body.appendChild(script);
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
          if (destroyed) return;

          const player = new window.Spotify.Player({
            name: "BeatTrack Premium",
            getOAuthToken: (cb: (t: string) => void) => cb(token),
            volume: 0.8,
          });

          playerRef.current = player;

          // READY
          player.addListener(
            "ready",
            async ({ device_id }: { device_id: string }) => {
              deviceIdRef.current = device_id;

              // transfer
              await fetch("https://api.spotify.com/v1/me/player", {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  device_ids: [device_id],
                  play: false,
                }),
              });

              // play
              await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    uris: [`spotify:track:${spotifyTrackId}`],
                  }),
                },
              );

              // activate audio
              if (!activatedRef.current) {
                activatedRef.current = true;
                try {
                  await player.activateElement();
                  await player.resume();
                } catch {}
              }

              // video
              videoRef.current?.play().catch(() => {});
              setPlaying(true);
              // video autoplay loop
              const tryPlayVideo = () => {
                const v = videoRef.current;
                if (!v) return;

                v.play().catch(() => {
                  requestAnimationFrame(tryPlayVideo);
                });
              };

              tryPlayVideo();
              setLoading(false);
            },
          );

          // STATE
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("player_state_changed", (state: any) => {
            if (!state) return;

            positionRef.current = state.position;
            durationRef.current = state.duration;

            setProgress(state.position);
            setDuration(state.duration);
            setPlaying(!state.paused);
          });

          // ERRORS
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("initialization_error", (e: any) =>
            console.error("init error", e),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("authentication_error", (e: any) =>
            console.error("auth error", e),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("account_error", (e: any) => {
            console.error("account error", e);
            setError("Brak Spotify Premium");
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("playback_error", (e: any) =>
            console.error("playback error", e),
          );

          player.connect();
        };
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
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [cardId]);

  function togglePlay() {
    const player = playerRef.current;
    const videoEl = videoRef.current;
    if (!player) return;

    if (playing) {
      player.pause();
      videoEl?.pause();
    } else {
      player.resume();
      videoEl?.play().catch(() => {});
    }

    setPlaying((p) => !p);
  }

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      if (playing) {
        positionRef.current += 100; // ms step
        setProgress(positionRef.current);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing]);

  const progressPercent = (progress / duration) * 100;

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
    </div>
  );
}
