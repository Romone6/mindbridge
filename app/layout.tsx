import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClinicProvider } from "@/components/providers/clinic-provider";
import TrustChatbot from "@/components/trust/trust-chatbot";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeScript } from "@/components/providers/theme-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mindbridge.health'),
  title: "MindBridge | AI-First Mental Health Clinic",
  description: "AI-assisted mental health intake for clinical teams. MindBridge standardizes intake workflows, captures structured clinical context, and routes cases to the right provider.",
  manifest: "/manifest.json",
  openGraph: {
    title: "MindBridge | AI-First Mental Health Clinic",
    description: "AI-assisted mental health intake for clinical teams.",
    url: "https://mindbridge.health",
    siteName: "MindBridge",
    images: [
      {
        url: "/apple-icon.png", // Using apple-icon as a fallback OG image since it's large and high quality
        width: 1200,
        height: 630,
        alt: "MindBridge Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindBridge | AI-First Mental Health Clinic",
    description: "AI-assisted mental health intake for clinical teams.",
    images: ["/apple-icon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: ["/favicon.ico"],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
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
  );
}
