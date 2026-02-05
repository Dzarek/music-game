"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

const SCANNER_ID = "qr-reader";

export default function ScanScreen({ autoStart = true }) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!autoStart) return;

    const qr = new Html5Qrcode(SCANNER_ID);
    qrRef.current = qr;

    qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (text) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        const match = text.match(/\/card\/([^/?]+)/);
        const cardId = match ? match[1] : text;

        qr.stop().finally(() => {
          router.replace(`/play?card=${cardId}`);
        });
      },
      () => {},
    );

    return () => {
      scannedRef.current = true;
      qrRef.current?.stop().catch(() => {});
      qrRef.current = null;
    };
  }, [autoStart, router]);

  return (
    <div className="h-dvh w-screen bg-black flex items-center justify-center">
      <div id={SCANNER_ID} className="w-full max-w-md" />
    </div>
  );
}
