import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ClinicProvider } from "@/components/providers/clinic-provider";
import TrustChatbot from "@/components/trust/trust-chatbot";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mindbridge.health'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'MindBridge | AI-First Mental Health Clinic',
    description: 'Clinical intake and triage workflows for mental health teams.',
    siteName: 'MindBridge',
    images: [
      {
        url: '/logo-og.png',
        width: 500,
        height: 500,
        alt: 'MindBridge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MindBridge | AI-First Mental Health Clinic',
    description: 'Clinical intake and triage workflows for mental health teams.',
    images: ['/logo-og.png'],
  },
  icons: {
    icon: '/logo-og.png',
    shortcut: '/logo-og.png',
    apple: '/logo-og.png',
  },
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
              <TrustChatbot />
              <Toaster />
            </ClinicProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
