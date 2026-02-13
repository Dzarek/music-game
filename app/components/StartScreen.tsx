"use client";

import React from "react";

type Props = {
  onStart: () => void;
  isPremium: boolean; // przekazujemy z Page.tsx
};

export default function StartScreen({ onStart, isPremium }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">Beat Track</h1>

      {/* 🔹 Zwykły przycisk start */}
      <button
        onClick={onStart}
        className="Btn text-xl cairo uppercase px-8 py-3 rounded-xl mb-4 text-white font-semibold"
      >
        Start
      </button>

      {/* 🔹 Zagraj Premium / Spotify */}
      <button
        onClick={() => {
          if (isPremium) {
            // jeśli już połączony z Spotify Premium, przełączamy od razu na ScanScreen
            onStart();
          } else {
            // jeśli nie, przekierowujemy na endpoint logowania Spotify
            window.location.href = "/api/auth/spotify";
          }
        }}
        className="Btn text-xl cairo uppercase px-8 py-3 rounded-xl text-white font-semibold"
      >
        Zagraj Premium
      </button>
    </div>
  );
}
