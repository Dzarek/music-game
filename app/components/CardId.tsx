"use client";

import { useParams, useRouter } from "next/navigation";
import PlayScreen from "./PlayScreen";

export default function CardComponent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <div className="h-dvh w-vw overflow-hidden">
      <PlayScreen cardId={id} onNext={() => router.push("/?autostart=true")} />
    </div>
  );
}
