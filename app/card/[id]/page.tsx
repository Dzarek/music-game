"use client";

import { useParams, useRouter } from "next/navigation";
import PlayScreen from "../../components/PlayScreen";

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return <PlayScreen cardId={id} onNext={() => router.push("/")} />;
}
