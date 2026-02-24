"use client";

import { useEffect, useRef } from "react";

type SpotifyState = {
  position: number;
  duration: number;
  paused: boolean;
};

type Props = {
  trackId: string;
  playing: boolean;
  onState?: (state: SpotifyState) => void;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Spotify: any;
  }
}

export default function SpotifyPlayer({ trackId, playing, onState }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const activatedRef = useRef(false);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      // 1️⃣ token
      const res = await fetch("/api/auth/spotify/token");
      const data = await res.json();
      const token = data?.token;

      if (!token || destroyed) return;

      // 2️⃣ SDK load
      if (!document.getElementById("spotify-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // 3️⃣ SDK ready
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (destroyed) return;

        const player = new window.Spotify.Player({
          name: "BeatTrack Player",
          getOAuthToken: (cb: (t: string) => void) => cb(token),
          volume: 0.8,
        });

        playerRef.current = player;

        // READY
        player.addListener(
          "ready",
          async ({ device_id }: { device_id: string }) => {
            deviceIdRef.current = device_id;

            // transfer playback
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
                  uris: [`spotify:track:${trackId}`],
                }),
              },
            );

            // audio activation
            if (!activatedRef.current) {
              activatedRef.current = true;
              try {
                await player.activateElement();
                await player.resume();
              } catch {}
            }
          },
        );

        // STATE
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("player_state_changed", (state: any) => {
          if (!state) return;

          onState?.({
            position: state.position,
            duration: state.duration,
            paused: state.paused,
          });
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
        player.addListener("account_error", (e: any) =>
          console.error("account error", e),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addListener("playback_error", (e: any) =>
          console.error("playback error", e),
        );

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
  }, [trackId, onState]);

  // PLAY / PAUSE CONTROL
  // useEffect(() => {
  //   if (!playerRef.current) return;

  //   if (playing) {
  //     playerRef.current.resume();
  //   } else {
  //     playerRef.current.pause();
  //   }
  // }, [playing]);

  return null;
}
