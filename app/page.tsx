"use client";

import { useState } from "react";
import StartScreen from "./components/StartScreen";
import ScanScreen from "./components/ScanScreen";
import PlayScreen from "./components/PlayScreen";

type GameState = "start" | "scan" | "play";

export default function Page() {
  const [state, setState] = useState<GameState>("start");
  const [cardId, setCardId] = useState<string | null>(null);
  // const [cardId, setCardId] = useState("1");

  return (
    <>
      {state === "start" && <StartScreen onStart={() => setState("scan")} />}

      {state === "scan" && (
        <ScanScreen
          onScan={(id) => {
            setCardId(id);
            setState("play");
          }}
          onCancel={() => setState("start")}
        />
      )}

      {state === "play" && cardId && (
        <PlayScreen cardId={cardId} onNext={() => setState("scan")} />
      )}
    </>
  );
}
