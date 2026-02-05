"use client";

import { useSearchParams } from "next/navigation";
import PlayScreen2 from "../components/PlayScreen2";

export default function PlayPage() {
  const params = useSearchParams();

  const cardId = params.get("id");
  if (!cardId) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden bg-black">
      <PlayScreen2 cardId={cardId} onNext={() => {}} />
    </div>
  );
}
