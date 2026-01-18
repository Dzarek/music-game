"use client";
import Image from "next/image";
type Props = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-screen bg-black text-white p-6">
      <Image
        alt="speakers"
        src="/images/speakers.png"
        width={500}
        height={500}
        className="w-[50vw] object-fill mb-18 speakersAnimation"
      />
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-widest uppercase ">
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
    </div>
  );
}
