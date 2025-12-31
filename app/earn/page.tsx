// app/earn/page.tsx
import type { Metadata } from "next";
import WorkersEarn from "./WorkersEarn"

export const metadata: Metadata = {
  title: "Earn Extra Income as a Service Provider | Choriad",
  description:
    "Join Choriad as a service provider and earn ₦360,000+ monthly as side hustle. Flexible schedule, instant payments, and 85% payout. Sign up now to start earning!",
  keywords: [
    "earn money in Nigeria",
    "service provider jobs",
    "side hustle",
    "part-time jobs",
    "home service provider",
    "personal assistant jobs",
    "freelance work Nigeria",
    "earn extra income",
    "service platform jobs",
    "choriad provider",
  ],
  authors: [{ name: "Choriad" }],
  openGraph: {
    type: "website",
    url: "https://choriad.vercel.app/earn",
    title: "Earn Extra Income as a Service Provider | Choriad",
    description:
      "Join Choriad as a service provider and earn ₦360,000+ monthly. Flexible schedule, instant payments, and 85% payout.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Earn with Choriad - Service Provider Opportunities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Earn Extra Income as a Service Provider | Choriad",
    description:
      "Join Choriad as a service provider and earn ₦360,000+ monthly. Flexible schedule, instant payments.",
    images: ["/logo.png"],
    creator: "@choriad",
  },
  alternates: {
    canonical: "/earn",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <WorkersEarn />;
}
