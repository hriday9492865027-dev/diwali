import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEEPAVALI — Personalized Interactive Diwali Celebration",
  description: "A magical, personalized digital Diwali celebration featuring light, fireworks, and memory portraits.",
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
      <body className="bg-diwali-night text-diwali-ivory antialiased selection:bg-diwali-gold selection:text-diwali-night">
        {children}
      </body>
    </html>
  );
}
