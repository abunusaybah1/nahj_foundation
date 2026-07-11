
import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nahj — Give With Clarity",
  description:
    "Every campaign, every donor, every naira — tracked openly from goal to delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable} antialiased`}
      >
        <Navbar /> 
        {children}
      </body>
    </html>
  );
}
