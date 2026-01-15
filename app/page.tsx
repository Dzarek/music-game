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

  useEffect(() => {
    if (window.location.search.includes("autostart=true")) {
      // 🔹 ustawienie stanu w setTimeout, aby uniknąć warningu
      setTimeout(() => {
        setAppState({ screen: "scan", autoStart: true });
        window.history.replaceState({}, "", "/");
      }, 0);
    }
  }, []);

  return (
    <>
      {appState.screen === "start" && (
        <StartScreen
          onStart={() => setAppState({ screen: "scan", autoStart: true })}
        />
      )}

      {appState.screen === "scan" && (
        <ScanScreen
          autoStart={appState.autoStart}
          onScan={(id) => {
            window.location.href = `/card/${id}?fromscan=true`;
          }}
          onCancel={() => setAppState({ screen: "start", autoStart: false })}
        />
      )}
    </>
  );
}
