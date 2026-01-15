"use client";

import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (cardId: string) => void;
  onCancel?: () => void;
};

const SCANNER_ID = "qr-reader";

export default function ScanScreen({ onScan, onCancel }: Props) {
  useEffect(() => {
    const qrCode = new Html5Qrcode(SCANNER_ID);

    qrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          qrCode.stop().then(() => {
            onScan(decodedText);
          });
        },
        () => {}
      )
      .catch(() => {
        alert("Nie można uruchomić kamery");
      });

    return () => {
      qrCode.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <Screen>
      <div id={SCANNER_ID} style={{ width: "100%" }} />

      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: 24,
            opacity: 0.6,
            fontSize: 14,
          }}
        >
          Anuluj
        </button>
      )}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}
