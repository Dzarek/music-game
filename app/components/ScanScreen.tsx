"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (cardId: string) => void;
  onCancel?: () => void;
};

const SCANNER_ID = "qr-reader";

export default function ScanScreen({ onScan, onCancel }: Props) {
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
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

        // 🔑 wyciągamy ID z URL
        const match = decodedText.match(/\/card\/([^/]+)/);
        const cardId = match ? match[1] : decodedText;

        qr.stop().finally(() => {
          qrCodeRef.current = null;
          onScan(cardId);
        });
      },
      (_errorMessage) => {
        // 🔇 ignorujemy błędy skanowania (normalne)
      }
    ).catch((err) => {
      alert("Nie można uruchomić kamery: " + err);
    });

    return () => {
      hasScannedRef.current = true;
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(() => {});
        qrCodeRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <Screen>
      <div id={SCANNER_ID} className="w-full max-w-md" />

      {onCancel && (
        <button onClick={onCancel} className="mt-6 text-sm opacity-60">
          Anuluj
        </button>
      )}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black p-4 text-white">
      {children}
    </div>
  );
}
