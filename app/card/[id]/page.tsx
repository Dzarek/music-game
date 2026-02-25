"use client";

import { useSearchParams } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import PlayScreen from "../../components/PlayScreen";

export default function CardPage() {
  const searchParams = useSearchParams();
  const premium = searchParams.get("premium") === "true";

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden">
      <PlayScreen
        cardId={id}
        onNext={() => router.push("/?autostart=true")}
        hasSpotifyPremium={premium}
      />
    </div>
  );
}
