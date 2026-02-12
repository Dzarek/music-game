"use client";
import { useEffect, useState } from "react";

type Props = { trackId: string };

export default function SpotifyPlayer({ trackId }: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("spotify_access_token="))
      ?.split("=")[1];

    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

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
        fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          {
            method: "PUT",
            body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      });

      player.connect();
      setPlayer(player);
    };
  }, [trackId]);

  return <div>Spotify Premium odtwarzanie...</div>;
}
