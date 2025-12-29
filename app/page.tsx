import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TrustSection } from "@/components/landing/trust-section"
import CTASection from "@/components/landing/cta-section"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"

export const metadata: Metadata = {
  title: {
    default: "Choriad - Your Personal Oga for Everyday Tasks",
    template: "%s | Choriad"
  },
  description: "Choriad finds trusted artisans, bargains for fair prices, books appointments and handles payments. Get help with plumbing, cleaning, repairs, and more in Lagos, Abuja, and other Nigerian cities.",
  keywords: [
    "personal assistant Nigeria",
    "find artisans Lagos",
    "home services Nigeria",
    "plumber near me",
    "electrician booking",
    "handyman services",
    "task management Nigeria",
    "AI assistant for chores",
    "trusted service providers",
    "Choriad AI",
    "everyday tasks helper",
    "local services platform",
    "Nigeria service providers"
  ],
  authors: [{ name: "Choriad" }],
  creator: "Choriad",
  publisher: "Choriad",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  metadataBase: new URL('https://choriad.vercel.app'),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://choriad.vercel.app",
    title: "Choriad - Your Personal Oga for Everyday Tasks in Nigeria",
    description: "Choriad goes out, finds trusted artisans, bargains for fair prices, books appointments and handles payment — you relax and carry on with your day.",
    siteName: "Choriad",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Choriad - Your Personal Assistant for Everyday Tasks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Choriad - Your Personal Oga for Everyday Tasks",
    description: "Find trusted artisans, get fair prices, and book services with Choriad's AI assistant.",
    images: ["/logo.png"],
    creator: "@choriad",
    site: "@choriad",
  },
  alternates: {
    canonical: '/',
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
  // For Nigerian local SEO
  other: {
    "geo.region": "NG",
    "geo.placename": "Nigeria",
    "geo.position": "9.081999;8.675277",
    "ICBM": "9.081999, 8.675277",
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
