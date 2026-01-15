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
