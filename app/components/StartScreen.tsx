"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
type Props = {
  onStart: () => void;
  // isPremium: boolean;
};

export default function StartScreen({ onStart }: Props) {
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsPremium(document.cookie.includes("spotify_access_token="));
    }, 0);
  }, []);

  const handlePremiumClick = () => {
    if (isPremium) {
      // jeśli już zalogowany, od razu ScanScreen
      onStart();
    } else {
      // jeśli nie, przekieruj do logowania Spotify
      window.location.href = "/api/auth/spotify";
    }
  };
  console.log(isPremium);
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-screen bg-black text-white p-6">
      <Image
        alt="speakers"
        src="/images/speakers.png"
        width={500}
        height={500}
        className="w-[50vw] md:w-[15vw] object-fill mb-18 speakersAnimation"
      />
      <div className="mb-20 text-center">
        <h1 className="text-4xl font-semibold audiowide tracking-wider uppercase ">
          Beat Track
        </h1>
        <p className="opacity-60 text-lg mt-2">Muzyczna Linia Czasu</p>
      </div>

      <button
        onClick={onStart}
        className="Btn text-xl cairo uppercase px-8 py-3 rounded-xl mb-10  text-white font-semibold"
      >
        Zagraj teraz
      </button>
      <button
        onClick={handlePremiumClick}
        className="Btn text-xl cairo uppercase px-8 py-3 rounded-xl mb-4 text-white font-semibold"
      >
        Gra Premium
      </button>
    </div>
  );
}
