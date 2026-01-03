import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ClinicProvider } from "@/components/providers/clinic-provider";
import TrustChatbot from "@/components/trust/trust-chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindBridge | AI-First Mental Health Clinic",
  description: "Clinical intake and triage workflows for mental health teams.",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        >
          <ClinicProvider>
            {children}
            <TrustChatbot />
            <Toaster />
          </ClinicProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
