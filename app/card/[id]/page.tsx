// "use client";

import { useParams, useRouter } from "next/navigation";
import PlayScreen from "../../components/PlayScreen";

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden">
      <PlayScreen cardId={id} onNext={() => router.push("/?autostart=true")} />
    </div>
  );
}
