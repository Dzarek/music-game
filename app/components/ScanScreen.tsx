"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (cardId: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
};

const SCANNER_ID = "qr-reader";

export default function ScanScreen({ onScan, onCancel, autoStart }: Props) {
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

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
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          const match = decodedText.match(/\/card\/([^/?]+)/);
          const cardId = match ? match[1] : decodedText;

          qr.stop().finally(() => {
            qrCodeRef.current = null;
            onScan(cardId);
          });
        },
        (_err) => {},
      ).catch((err) => alert("Nie można uruchomić kamery: " + err));
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
  }, [onScan, autoStart]);

  return (
    <div className="flex h-dvh w-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div id={SCANNER_ID} className="w-full max-w-md" />

      {onCancel && (
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
