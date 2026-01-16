import type { Metadata } from "next";
import { Bitter, Cairo } from "next/font/google";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const cairo = Cairo({
  variable: "--font-cairo",
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beat Track",
  description: "Muzyczna Linia Czasu",
  manifest: "/manifest.json",
  keywords: ["muzyka", "impreza"],
  openGraph: {
    title: "Beat Track",
    description: "Muzyczna Linia Czasu",
    url: "https://music-game-dzarek.netlify.app/",
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
    <html lang="en">
      <body className={`${bitter.variable} ${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
