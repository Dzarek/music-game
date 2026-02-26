"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import PlayScreen from "../../components/PlayScreen";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";

export default function CardPage() {
  const searchParams = useSearchParams();
  const premium = searchParams.get("premium") === "true";

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden">
      {!premium ? (
        <PlayScreen
          cardId={id}
          onNext={() => router.push("/?autostart=true")}
        />
      ) : (
        <SpotifyPlayer
          cardId={id}
          onNext={() => router.push("/?autostart=true")}
        />
      )}
    </div>
  );
}
