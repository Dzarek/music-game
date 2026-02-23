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
  console.log(isPremium);
  return (
    <>
      {/* 🔹 Informacja o Spotify Premium */}
      {isPremium && (
        // <div className="fixed z-50 top-4 right-4 bg-green-800 px-2 py-1 rounded text-xs uppercase font-bold">
        //   Spotify Premium
        // </div>
        <button
          onClick={() => {
            window.location.href = "/api/auth/spotify/logout";
          }}
          className="fixed z-50 top-4 right-4 bg-green-800 px-2 py-1 rounded text-xs uppercase font-bold text-white"
        >
          Wyloguj Spotify
        </button>
      )}

      {/* 🔹 StartScreen */}
      {appState.screen === "start" && (
        <StartScreen
          onStart={() => setAppState({ screen: "scan", autoStart: true })}
          isPremium={isPremium} // można przekazać props żeby StartScreen zmienił zachowanie
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
