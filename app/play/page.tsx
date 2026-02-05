"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PlayScreen2 from "../components/PlayScreen2";

export default function PlayPage() {
  const params = useSearchParams();
  const router = useRouter();

  const cardId = params.get("card");
  if (!cardId) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden bg-black">
      <PlayScreen2
        cardId={cardId}
        onNext={() => router.replace("/scan?autostart=true")}
      />
    </div>
  );
}
