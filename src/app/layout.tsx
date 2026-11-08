import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FestiveSoundscape } from "@/components/audio/FestiveSoundscape";

export const metadata: Metadata = {
  title: "DEEPAVALI — Personalized Interactive Diwali Celebration",
  description: "A magical, personalized digital Diwali celebration featuring light, fireworks, and memory portraits.",
  openGraph: {
    title: "DEEPAVALI — Festival of Lights",
    description: "Experience your personalized Diwali memory sculpted in fireworks and starlight particles.",
    url: "https://deepavali.vercel.app",
    siteName: "DEEPAVALI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEEPAVALI — Festival of Lights",
    description: "A magical, personalized digital Diwali celebration platform.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#02040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-diwali-night text-diwali-ivory antialiased selection:bg-diwali-gold selection:text-diwali-night min-h-screen relative">
        {children}
        {/* Global Ambient Diwali Soundscape Controller */}
        <FestiveSoundscape />
      </body>
    </html>
  );
}

