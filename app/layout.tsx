import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ClinicProvider } from "@/components/providers/clinic-provider";

const signalDisplay = Fraunces({
  variable: "--font-signal-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const signalSans = Space_Grotesk({
  variable: "--font-signal-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const signalMono = IBM_Plex_Mono({
  variable: "--font-signal-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MindBridge | AI-First Mental Health Clinic",
  description: "Reduce wait times from 48 days to 5 minutes with clinical-grade AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${signalDisplay.variable} ${signalSans.variable} ${signalMono.variable} antialiased min-h-screen bg-background text-foreground`}
        >
          <ClinicProvider>
            {children}
            <Toaster />
          </ClinicProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
