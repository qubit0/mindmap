import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoDeva = Noto_Serif_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TanaBana · An Interactive Map of AI",
  description:
    "An interactive woven mind map of Artificial Intelligence — its types, capabilities, applications in Nepal and their energy costs — threaded with stories from home. Part of TanaBana: Weaving through Technology, Power & Justice, Yalamaya Kendra, Patan Dhoka, Lalitpur.",
  keywords: [
    "TanaBana",
    "AI mind map",
    "Nepal",
    "interactive exhibition",
    "digital rights",
    "weaving",
  ],
  authors: [{ name: "TanaBana Collective" }],
  openGraph: {
    title: "TanaBana · An Interactive Map of AI",
    description:
      "Pull a thread. Follow the weave. An interactive mind map of AI in the Nepali context.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F1E7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // Grammarly & co. inject attributes into <body> before React
        // hydrates — silence that one-level attribute mismatch warning.
        suppressHydrationWarning
        className={`${inter.variable} ${notoDeva.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
