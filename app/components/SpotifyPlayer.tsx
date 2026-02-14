"use client";
import { useEffect, useRef, useState } from "react";

type Props = { trackId: string };

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Spotify: any;
  }
}

export default function SpotifyPlayer({ trackId }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<string>("Ładowanie Spotify Player...");

  useEffect(() => {
    let destroyed = false;

    async function init() {
      // 1️⃣ Pobierz token z API
      const res = await fetch("/api/auth/spotify/token");
      const data = await res.json();
      const token = data?.token;

      if (!token || destroyed) {
        setStatus("Brak tokenu Spotify");
        return;
      }

      // 2️⃣ Załaduj SDK (jeśli nie istnieje)
      if (!document.getElementById("spotify-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // 3️⃣ SDK ready handler
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (destroyed) return;

        const player = new window.Spotify.Player({
          name: "BeatTrack Premium",
          getOAuthToken: (cb: (t: string) => void) => cb(token),
          volume: 0.8,
        });

        playerRef.current = player;

        // 4️⃣ Ready = mamy device_id
        player.addListener(
          "ready",
          async ({ device_id }: { device_id: string }) => {
            deviceIdRef.current = device_id;
            setStatus("Połączono z Spotify");

            // 5️⃣ Transfer playback na nasz player
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

            // 6️⃣ Play track
            await fetch(
              `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uris: [`spotify:track:${trackId}`],
                }),
              },
            );

            setStatus("Odtwarzanie Spotify Premium");
          },
        );

        // 7️⃣ Error handling
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("initialization_error", (e: any) => {
          console.error("init error", e);
          setStatus("Błąd inicjalizacji Spotify");
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("authentication_error", (e: any) => {
          console.error("auth error", e);
          setStatus("Błąd autoryzacji Spotify");
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("account_error", (e: any) => {
          console.error("account error", e);
          setStatus("Brak Spotify Premium");
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("playback_error", (e: any) => {
          console.error("playback error", e);
          setStatus("Błąd odtwarzania Spotify");
        });

        // 8️⃣ Connect player
        player.connect();
      };
    }

    init();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [trackId]);

  return (
    <div className="w-full h-full flex items-center justify-center text-white text-sm opacity-80">
      {status}
    </div>
  );
}
