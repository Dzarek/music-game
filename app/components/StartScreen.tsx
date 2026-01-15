"use client";

type Props = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: Props) {
  return (
    <Screen>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, letterSpacing: 4 }}>HITSTER</h1>
        <p style={{ opacity: 0.6 }}>Music Timeline Game</p>
      </div>

      <button onClick={onStart} style={buttonStyle}>
        Zagraj teraz
      </button>
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
        textAlign: "center",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  fontSize: 24,
  padding: "16px 32px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
};
