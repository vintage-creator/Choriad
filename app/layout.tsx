// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ToasterProvider } from "@/components/providers/toaster-provider";

export const metadata: Metadata = {
  title: {
    default: "Choriad - Your Trusted Service Platform",
    template: "%s | Choriad"
  },
  description: "Connect with verified service providers in Nigerian cities. Get help with cleaning, repairs, deliveries, and everyday tasks. Earn extra income as a service provider.",
  keywords: ["service platform", "Nigerian service providers", "task management", "home services", "earn money"],
  authors: [{ name: "Choriad" }],
  creator: "Israel Abazie",
  publisher: "Choriad",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/favicon.ico' },
    ]
  },
  metadataBase: new URL('https://choriad.vercel.app'), 
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://choriad.vercel.app",
    title: "Choriad - Your Trusted Service Platform",
    description: "Connect with verified service providers in Nigerian cities.",
    siteName: "Choriad",
    images: [
      {
        url: "/favicon.ico", 
        width: 1200,
        height: 630,
        alt: "Choriad Platform Preview",
      },
    ],

  },
  twitter: {
    card: "summary_large_image",
    title: "Choriad - Your Trusted Service Platform",
    description: "Connect with verified service providers in Nigerian cities.",
    images: ["/logo.png"], 
    creator: "@choriad",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <ToasterProvider />
        <Analytics />
      </body>
    </html>
  )
}