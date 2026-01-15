"use client";

import { useState } from "react";
import StartScreen from "./components/StartScreen";
import ScanScreen from "./components/ScanScreen";

type GameState = "start" | "scan";

export default function Page() {
  const [state, setState] = useState<GameState>("start");

  return (
    <>
      {state === "start" && <StartScreen onStart={() => setState("scan")} />}

      {state === "scan" && (
        <ScanScreen
          onScan={(id) => {
            // QR skanowany WEWNĄTRZ aplikacji
            // przekierowujemy na właściwy route
            window.location.href = `/card/${id}`;
          }}
          onCancel={() => setState("start")}
        />
      )}
    </>
  );
}
