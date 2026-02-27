"use client";

import { useEffect, useState } from "react";
import StartScreen from "./components/StartScreen";
import ScanScreen from "./components/ScanScreen";

type Screen = "start" | "scan";

type AppState = {
  screen: Screen;
  autoStart: boolean;
};

export default function Page() {
  const [appState, setAppState] = useState<AppState>({
    screen: "start",
    autoStart: false,
  });
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsPremium(document.cookie.includes("spotify_logged_in=true"));
    }, 0);
    // 🔹 jeśli połączony z Spotify Premium lub autostart=true w URL
    const autostart = window.location.search.includes("autostart=true");
    if (isPremium || autostart) {
      setTimeout(() => {
        setAppState({ screen: "scan", autoStart: true });
        if (autostart) window.history.replaceState({}, "", "/");
      }, 0);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // zatrzymaj playback
      await fetch("/api/auth/spotify/pause");

      // disconnect SDK
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).spotifyPlayer) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).spotifyPlayer.disconnect();
      }

      // logout app
      window.location.href = "/api/auth/spotify/logout";
    } catch {
      window.location.href = "/api/auth/spotify/logout";
    }
  };
  return (
    <>
      {isPremium && (
        <button
          onClick={handleLogout}
          className="fixed z-40 top-4 right-4 bg-green-800 px-2 py-1 rounded text-xs uppercase font-bold text-white"
        >
          Wyloguj Spotify
        </button>
      )}

      {/* 🔹 StartScreen */}
      {appState.screen === "start" && (
        <StartScreen
          onStart={() => setAppState({ screen: "scan", autoStart: true })}
          isPremium={isPremium}
          setIsPremium={setIsPremium}
        />
      )}

      {/* 🔹 ScanScreen */}
      {appState.screen === "scan" && (
        <ScanScreen
          autoStart={appState.autoStart}
          onScan={(id) => {
            const url = isPremium ? `/card/${id}?premium=true` : `/card/${id}`;
            window.location.href = url;
          }}
          onCancel={() => setAppState({ screen: "start", autoStart: false })}
        />
      )}
    </>
  );
}
