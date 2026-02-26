"use client";

import { useEffect, useRef, useState } from "react";
import { FaCirclePlay, FaCircleStop } from "react-icons/fa6";
import { ImNext } from "react-icons/im";
import Loading from "./Loading";
import { getCardData } from "@/lib/cardCache";

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
  // const deviceIdRef = useRef<string | null>(null);
  const activatedRef = useRef(false);

  // Video
  const videoRef = useRef<HTMLVideoElement>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const video = "/video2.mp4";

  // ---------- VIDEO SAFE AUTOPLAY ----------
  const ensureVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.play().catch(() => {
        requestAnimationFrame(tryPlay);
      });
    };

    tryPlay();
  };

  // ---------- INIT ----------
  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        /* ---------- DATA PARALLEL ---------- */
        const token = sessionStorage.getItem("spotify_token");
        const { spotifyTrackId } = await getCardData(cardId);
        if (!token) throw new Error("no token");
        if (!spotifyTrackId) throw new Error("no spotifyTrackId");

        const startPlayer = () => {
          if (destroyed) return;

          const player = new window.Spotify.Player({
            name: "BeatTrack Premium",
            getOAuthToken: (cb: (t: string) => void) => cb(token),
            volume: 0.8,
          });

          playerRef.current = player;

          /* ---------- READY ---------- */
          player.addListener(
            "ready",
            async ({ device_id }: { device_id: string }) => {
              if (destroyed) return;

              // Play
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

              if (!activatedRef.current) {
                activatedRef.current = true;
                try {
                  await player.activateElement();
                  await player.resume();
                } catch {}
              }
              ensureVideoPlay();
              setPlaying(true);
              setLoading(false);
            },
          );

          /* ---------- STATE SYNC ---------- */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("player_state_changed", (state: any) => {
            if (!state) return;

            setPlaying(!state.paused);

            // 🎥 Video sync ONLY when audio is реально playing
            if (!state.paused) {
              ensureVideoPlay();
            } else {
              videoRef.current?.pause();
            }
          });

          player.connect();
        };
        // SDK preload logic
        if (window.Spotify) {
          startPlayer();
        } else {
          if (!document.getElementById("spotify-sdk")) {
            const script = document.createElement("script");
            script.id = "spotify-sdk";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
          }

          window.onSpotifyWebPlaybackSDKReady = () => {
            startPlayer();
          };
        }
      } catch (e) {
        if (!destroyed) {
          console.error(e);
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

  /* ---------- TOGGLE ---------- */
  function togglePlay() {
    const player = playerRef.current;
    if (!player) return;

    if (playing) {
      player.pause();
      videoRef.current?.pause();
    } else {
      player.resume();
      ensureVideoPlay();
    }
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
          {/* VIDEO */}
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

            {/* CONTROLS */}
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

          {/* NEXT */}
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
