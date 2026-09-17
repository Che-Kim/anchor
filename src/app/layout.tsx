import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import { JellyfishProvider } from "@/components/jellyfish/JellyfishProvider";
import "./globals.css";

// Plex Sans + Plex Mono are a designed pair; Instrument Serif supplies the
// editorial contrast that a UI sans can't carry on its own.
const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Anchor",
  description:
    "A planner that reads your day, lifts it when it drags, and helps you write it down.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <JellyfishProvider />
        {children}
      </body>
    </html>
  );
}
