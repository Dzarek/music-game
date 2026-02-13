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

  // 🔹 sprawdzenie, czy użytkownik połączony z Spotify
  const isPremium = document.cookie.includes("spotify_access_token=");

  useEffect(() => {
    if (isPremium) {
      setTimeout(() => {
        setAppState({ screen: "scan", autoStart: true });
      }, 0);
    }

    // 🔹 obsługa parametru autostart z URL (np. ?autostart=true)
    if (window.location.search.includes("autostart=true")) {
      setTimeout(() => {
        setAppState({ screen: "scan", autoStart: true });
        window.history.replaceState({}, "", "/");
      }, 0);
    }
  }, [isPremium]);

  return (
    <>
      {/* 🔹 Informacja o Spotify Premium */}
      {isPremium && (
        <div className="fixed z-50 top-4 right-4 bg-green-600 px-2 py-1 rounded text-xs uppercase font-bold">
          Spotify Premium
        </div>
      )}

      {/* 🔹 StartScreen */}
      {appState.screen === "start" && (
        <StartScreen
          onStart={() => setAppState({ screen: "scan", autoStart: true })}
        />
      )}

      {/* 🔹 ScanScreen */}
      {appState.screen === "scan" && (
        <ScanScreen
          autoStart={appState.autoStart}
          onScan={(id) => {
            // 🔹 przekazanie info premium do PlayScreen
            const url = isPremium ? `/card/${id}?premium=true` : `/card/${id}`;
            window.location.href = url;
          }}
          onCancel={() => setAppState({ screen: "start", autoStart: false })}
        />
      )}
    </>
  );
}
