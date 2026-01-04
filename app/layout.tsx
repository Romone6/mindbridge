import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ClinicProvider } from "@/components/providers/clinic-provider";
import TrustChatbot from "@/components/trust/trust-chatbot";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SwRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";

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
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        >
          <ThemeProvider>
            <ClinicProvider>
              {children}
              <SwRegister />
              <InstallPrompt />
              <TrustChatbot />
              <Toaster />
            </ClinicProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
