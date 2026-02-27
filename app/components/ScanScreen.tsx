"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

type Props = {
  onScan: (cardId: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
};

const SCANNER_ID = "qr-reader";

export default function ScanScreen({ onScan, onCancel, autoStart }: Props) {
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const router = useRouter();
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const startScanner = () => {
      const qr = new Html5Qrcode(SCANNER_ID);
      qrCodeRef.current = qr;

      qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (vw, vh) => {
            const size = Math.min(vw, vh) * 0.8;
            return { width: size, height: size };
          },
        },
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          setFinishing(true);

          const match = decodedText.match(/\/card\/([^/?]+)/);
          const cardId = match ? match[1] : decodedText;

          // 🔥 preload token
          try {
            const tokenRes = await fetch("/api/auth/spotify/token");
            const tokenData = await tokenRes.json();
            if (tokenData?.token) {
              sessionStorage.setItem("spotify_token", tokenData.token);
            }
          } catch {}

          // 🔥 preload card
          fetch(`/api/card/${cardId}/play`);

          // 🔥 preload SDK
          if (!document.getElementById("spotify-sdk")) {
            const script = document.createElement("script");
            script.id = "spotify-sdk";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
          }

          router.prefetch(`/card/${cardId}`);
          onScan(cardId);
          // navigator.vibrate?.(20);

          qr.stop().catch(() => {});
          qrCodeRef.current = null;
        },
        () => {},
      ).catch((err) => {
        alert("Nie można uruchomić kamery: " + err);
      });
    };

    if (autoStart) {
      startScanner();
    }

    return () => {
      hasScannedRef.current = true;
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(() => {});
        qrCodeRef.current = null;
      }
    };
  }, [onScan, autoStart, router]);

  return (
    <div className="flex z-50 h-dvh w-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div id={SCANNER_ID} className="w-full max-w-md" />

      {onCancel && !finishing && (
        <button
          onClick={onCancel}
          className="mt-10 text-xl uppercase font-semibold opacity-60"
        >
          Anuluj
        </button>
      )}
    </div>
  );
}
