"use client";
import Image from "next/image";
type Props = {
  onStart: () => void;
  isPremium: boolean;
};

export default function StartScreen({ onStart, isPremium }: Props) {
  const handlePremiumClick = () => {
    if (isPremium) {
      onStart();
    } else {
      window.location.href = "/api/auth/spotify";
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-screen bg-black text-white p-6">
      <Image
        alt="speakers"
        src="/images/speakers.png"
        width={500}
        height={500}
        className="w-[45vw] md:w-[15vw] max-h-[30vh] object-fill mb-10 mt-6 speakersAnimation"
      />
      <div className="mb-20 text-center">
        <h1 className="text-4xl font-semibold audiowide tracking-wider uppercase ">
          Beat Track
        </h1>
        <p className="opacity-60 text-lg mt-2">Muzyczna Linia Czasu</p>
      </div>
      <div className="w-full mt-10 max-h-[60vh] flex flex-col lg:flex-row justify-center items-center gap-12 border-2 border-white py-[5vh] rounded-2xl pt-[7vh] relative ">
        <h3 className="uppercase bg-black absolute -top-6 font-semibold text-2xl cairo w-3/5 text-center left-1/2 -translate-x-1/2 p-2">
          Zagraj Teraz
        </h3>
        <button
          onClick={onStart}
          className="Btn Btn1 w-4/5 lg:w-62 flex flex-col justify-center items-center text-xl cairo uppercase px-8 py-3 rounded-xl text-white font-semibold"
        >
          <p>Tryb Zwykły</p>
          <span className="lowercase text-sm mt-2 text-zinc-400 ">
            nie wymaga niczego
          </span>
        </button>
        <button
          onClick={handlePremiumClick}
          className="Btn Btn2 w-4/5  lg:w-62 flex flex-col justify-center items-center text-xl cairo uppercase px-8 py-3 rounded-xl  text-white font-semibold"
        >
          <p>Tryb Premium</p>
          <span className="lowercase text-sm mt-2 text-zinc-400">
            wymaga spotify premium
          </span>
        </button>
      </div>
    </div>
  );
}
