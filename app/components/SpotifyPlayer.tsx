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
  const videoRef = useRef<HTMLVideoElement>(null);
  const activatedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const video = "/video2.mp4";

  const forceVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.play().catch(() => requestAnimationFrame(tryPlay));
    };
    tryPlay();
  };

  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        // 1️⃣ pobierz token i trackId
        const tokenRes = await fetch("/api/auth/spotify/token");
        const tokenData = await tokenRes.json();
        const token = tokenData?.token;
        if (!token) throw new Error("Brak tokenu Spotify");

        const res = await fetch(`/api/card/${cardId}/play`);
        if (!res.ok) throw new Error("Brak karty");
        const { spotifyTrackId } = await res.json();
        if (!spotifyTrackId) throw new Error("Brak Spotify trackId");

        // 2️⃣ załaduj SDK
        if (!document.getElementById("spotify-sdk")) {
          const script = document.createElement("script");
          script.id = "spotify-sdk";
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          document.body.appendChild(script);
        }

        // 3️⃣ handler ready
        window.onSpotifyWebPlaybackSDKReady = () => {
          if (destroyed) return;

          const player = new window.Spotify.Player({
            name: "BeatTrack Premium",
            getOAuthToken: (cb: (t: string) => void) => cb(token),
            volume: 0.8,
          });

          playerRef.current = player;

          player.addListener(
            "ready",
            async ({ device_id }: { device_id: string }) => {
              if (destroyed) return;

              try {
                // ustaw track i odtwórz
                await player.connect();
                await player._options.getOAuthToken((t: string) => {
                  player
                    .play({
                      uris: [`spotify:track:${spotifyTrackId}`],
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .catch((e: any) => {
                      console.warn("Spotify play error:", e);
                      setError("Nie można odtworzyć Spotify");
                    });
                });

                // aktywacja audio
                if (!activatedRef.current) {
                  activatedRef.current = true;
                  await player.activateElement();
                }

                // video
                forceVideoPlay();
                setPlaying(true);
                setLoading(false);
              } catch (e) {
                console.error(e);
                setError("Błąd odtwarzania Spotify");
                setLoading(false);
              }
            },
          );

          // Errors
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("initialization_error", (e: any) =>
            console.error(e),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("authentication_error", (e: any) =>
            console.error(e),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("account_error", (e: any) => {
            console.error(e);
            setError("Brak Spotify Premium");
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("playback_error", (e: any) => console.error(e));

          player.connect();
        };

        // Jeśli SDK już było wcześniej załadowane
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Spotify) {
          window.onSpotifyWebPlaybackSDKReady();
        }
      } catch (e) {
        console.error(e);
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

  const togglePlay = () => {
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
  };

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
