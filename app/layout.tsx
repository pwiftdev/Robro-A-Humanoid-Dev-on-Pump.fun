import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-inter-black"
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono"
});

export const metadata: Metadata = {
  title: "$ROBRO — The Humanoid Dev",
  description: "No humans. No rugs. Just ROBRO."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable}`}>{children}</body>
    </html>
  );
}
