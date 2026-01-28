import type { Metadata } from "next";
import { Cairo, Audiowide } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  weight: ["400"],
  subsets: ["latin"],
});
const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beat Track",
  description: "Muzyczna Linia Czasu",
  manifest: "/manifest.json",
  themeColor: "#000000",
  keywords: ["muzyka", "impreza"],
  openGraph: {
    title: "Beat Track",
    description: "Muzyczna Linia Czasu",
    url: "https://beat-track.netlify.app/",
    type: "website",
    images: [
      {
        url: "/logoRounded.png",
        width: 500,
        height: 500,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body
        className={`${cairo.variable} ${audiowide.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
