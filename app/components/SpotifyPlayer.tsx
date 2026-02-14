"use client";
import { useEffect, useState } from "react";

type Props = { trackId: string };

export default function SpotifyPlayer({ trackId }: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    let destroyed = false;
    fetch("/api/spotify/token")
      .then((r) => r.json())
      .then(({ token }) => {
        if (!token || destroyed) return;

        // SDK loader
        if (!document.getElementById("spotify-sdk")) {
          const script = document.createElement("script");
          script.id = "spotify-sdk";
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          document.body.appendChild(script);
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
          const player = new window.Spotify.Player({
            name: "Beat Track Premium",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getOAuthToken: (cb: any) => {
              cb(token);
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          player.addListener("ready", ({ device_id }: { device_id: any }) => {
            fetch("https://api.spotify.com/v1/me/player", {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                device_ids: [device_id],
                play: false,
              }),
            })
              .then(() => {
                // ▶️ 2. PLAY TRACK
                return fetch("https://api.spotify.com/v1/me/player/play", {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`],
                  }),
                });
              })
              .catch(console.error);
          });

          player.addListener("initialization_error", console.error);
          player.addListener("authentication_error", console.error);
          player.addListener("account_error", console.error);
          player.addListener("playback_error", console.error);

          player.connect();
          setPlayer(player);
        };
      });
    return () => {
      destroyed = true;
    };
  }, [trackId]);

  return <div>Spotify Premium odtwarzanie...</div>;
}
