import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn Extra Income as a Service Provider | Choriad",
  description: "Join Choriad as a service provider and earn ₦360,000+ monthly. Flexible schedule, instant payments, and 85% payout. Sign up now to start earning!",
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
    "choriad provider"
  ],
  authors: [{ name: "Choriad" }],
  openGraph: {
    type: "website",
    url: "https://choriad.vercel.app/earn",
    title: "Earn Extra Income as a Service Provider | Choriad",
    description: "Join Choriad as a service provider and earn ₦360,000+ monthly. Flexible schedule, instant payments, and 85% payout.",
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
    description: "Join Choriad as a service provider and earn ₦360,000+ monthly. Flexible schedule, instant payments.",
    images: ["/logo.png"], 
    creator: "@choriad",
  },
  alternates: {
    canonical: '/earn',
  },
  robots: {
    index: true,
    follow: true,
  },
};


"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  PiggyBank,
  Clock,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Star,
  Award,
  Wallet,
  Smartphone,
  MapPin,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";


// SVG Pattern Components
const PatternCircleGrid = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="circleGrid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circleGrid)" />
    </svg>
  );
  
  const PatternCheckGrid = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="checkGrid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 20 L20 20 L20 0"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M20 20 L40 20 L40 40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#checkGrid)" />
    </svg>
  );
  
  const PatternWave = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="wave" width="100" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0,10 Q25,5 50,10 T100,10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wave)" />
    </svg>
  );
  
  const PatternDots = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="3" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
  
  const PatternShield = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="shield" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M30,5 L55,15 L55,30 Q55,45 30,55 Q5,45 5,30 L5,15 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#shield)" />
    </svg>
  );
  
  const PatternArrows = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="arrows" width="50" height="50" patternUnits="userSpaceOnUse">
          <path
            d="M25,0 L50,25 L25,50 L0,25 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arrows)" />
    </svg>
  );
  
  const PatternHexagon = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hexagon"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30,0 L56,15 L56,45 L30,60 L4,45 L4,15 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagon)" />
    </svg>
  );
  
  const PatternTriangle = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="triangle"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="20,0 40,40 0,40"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#triangle)" />
    </svg>
  );
  
  const PatternMap = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="map" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle
            cx="40"
            cy="40"
            r="25"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="40" cy="40" r="5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#map)" />
    </svg>
  );
  
  const PatternCalendar = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="calendar"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="5"
            y="10"
            width="50"
            height="40"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="5"
            y="10"
            width="50"
            height="10"
            fill="currentColor"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#calendar)" />
    </svg>
  );
  
  const PatternMoney = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="money" width="50" height="50" patternUnits="userSpaceOnUse">
          <path
            d="M25,5 C35,5 45,15 45,25 C45,35 35,45 25,45 C15,45 5,35 5,25 C5,15 15,5 25,5 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="25"
            y="28"
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            fontWeight="bold"
          >
            ₦
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#money)" />
    </svg>
  );
  
  const PatternStars = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="stars" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M20,0 L24,14 L38,14 L26,22 L30,36 L20,28 L10,36 L14,22 L2,14 L16,14 Z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stars)" />
    </svg>
  );
  
  // Component to render pattern based on type
  const Pattern = ({ type }: { type: string }) => {
    switch (type) {
      case "circleGrid":
        return <PatternCircleGrid />;
      case "checkGrid":
        return <PatternCheckGrid />;
      case "wave":
        return <PatternWave />;
      case "dots":
        return <PatternDots />;
      case "shield":
        return <PatternShield />;
      case "arrows":
        return <PatternArrows />;
      case "hexagon":
        return <PatternHexagon />;
      case "triangle":
        return <PatternTriangle />;
      case "map":
        return <PatternMap />;
      case "calendar":
        return <PatternCalendar />;
      case "money":
        return <PatternMoney />;
      case "stars":
        return <PatternStars />;
      default:
        return <PatternCircleGrid />;
    }
  };

const earningCategories = [
    {
      title: "Personal Services",
      gradient: "from-blue-500 to-cyan-500",
      pattern: "hexagon",
      services: [
        { name: "Personal Shopper", rate: "₦7,000 - ₦15,000 per trip", description: "Shop for busy families and individuals" },
        { name: "Home Chef", rate: "₦5,000 - ₦15,000 per meal", description: "Prepare meals in clients' homes" },
        { name: "In-House Barber", rate: "₦3,500 - ₦7,000 per session", description: "Mobile haircut services" },
        { name: "Family Tutor", rate: "₦3,000 - ₦15,000 per hour", description: "Academic tutoring at home" },
      ],
    },
    {
      title: "Home Services",
      gradient: "from-emerald-500 to-green-500",
      pattern: "triangle",
      services: [
        { name: "Home Cleaner", rate: "₦10,500 - ₦22,000 per session", description: "Regular or deep cleaning" },
        { name: "Compound Sweeper", rate: "₦7,000 - ₦15,000 per visit", description: "Yard and compound maintenance" },
        { name: "Handyman", rate: "₦5,000 - ₦30,000 per job", description: "Repairs and maintenance" },
        { name: "Cobweb Removal", rate: "₦5,500 - ₦20,000 per house", description: "Seasonal cleaning service" },
      ],
    },
    {
      title: "Care Services",
      gradient: "from-purple-500 to-pink-500",
      pattern: "checkGrid",
      services: [
        { name: "Home Nurse", rate: "₦10,000 - ₦25,000 per visit", description: "Medical care at home" },
        { name: "Elderly Companion", rate: "₦10,000 - ₦25,000 per day", description: "Company and assistance" },
        { name: "Errand Runner", rate: "₦5,000 - ₦13,000 per errand", description: "Pickups and deliveries" },
        { name: "Event Helper", rate: "₦15,000 - ₦30,000 per event", description: "Party setup and support" },
      ],
    },
  ];

const benefits = [
    {
      title: "Flexible Schedule",
      description: "Work when you want, take jobs that fit your availability",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      pattern: "calendar",
    },
    {
      title: "Instant Payment",
      description: "Get paid directly to your bank account after each completed job",
      icon: PiggyBank,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      pattern: "money",
    },
    {
      title: "Verified Clients",
      description: "All clients are verified and payments are secured through Choriad",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      pattern: "shield",
    },
    {
      title: "Growing Demand",
      description: "Join a platform with increasing demand for local services",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      pattern: "arrows",
    },
    {
      title: "Local Community",
      description: "Connect with clients in your neighborhood and nearby areas",
      icon: MapPin,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      pattern: "map",
    },
    {
      title: "24/7 Support",
      description: "Get help whenever you need it from our dedicated support team",
      icon: Phone,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      pattern: "wave",
    },
    {
      title: "Build Reputation",
      description: "Earn reviews and ratings that help you get more jobs",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      pattern: "stars",
    },
    {
      title: "No Monthly Fees",
      description: "Pay only when you earn - no subscriptions or hidden charges",
      icon: CheckCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      pattern: "checkGrid",
    },
  ];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up and showcase your skills, experience, and availability",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    pattern: "circleGrid",
  },
  {
    number: "02",
    title: "Get Verified",
    description:
      "Complete our verification process to build trust with clients",
    icon: Award,
    gradient: "from-emerald-500 to-green-500",
    pattern: "checkGrid",
  },
  {
    number: "03",
    title: "Receive Job Requests",
    description: "Get matched with clients in your area based on your skills",
    icon: Phone,
    gradient: "from-purple-500 to-pink-500",
    pattern: "wave",
  },
  {
    number: "04",
    title: "Get Paid",
    description: "Complete jobs and receive payment directly to your account",
    icon: Wallet,
    gradient: "from-orange-500 to-red-500",
    pattern: "dots",
  },
];



export default function EarnPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"client" | "provider" | null>(null);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        setUserType(profile?.user_type || null);
      }
    };

    checkUser();
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (userType === "provider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/auth/become-provider");
      }
    } else {
      router.push("/auth/sign-up?type=provider");
    }
    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      },
    },
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-50/50">
        {/* Hero Section with Image */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src="/images/earn/hero-bg.jpg" 
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-emerald-700/90" />
          </div>

          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                ref={heroRef}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
                    <Zap className="h-4 w-4" />
                    Start Earning Today
                  </span>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white"
                >
                  Turn Your Skills Into
                  <span className="block text-yellow-300 mt-2">
                    Extra Income
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-xl text-white/90 mb-8"
                >
                  Whether you're a personal shopper, home chef, tutor, or
                  handyman — connect with clients in your community and earn on
                  your own schedule.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    disabled={isLoading}
                    className="px-8 py-6 text-base bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    {isLoading ? "Loading..." : "Start Earning Today"}
                  </Button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-6 text-white/80"
                ></motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={heroInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/hero-image.png"
                    alt="Provider earning with Choriad"
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                  {/* Floating Stats Card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-xs"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-emerald-600 flex items-center justify-center">
                        <PiggyBank className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Average Earnings
                        </div>
                        <div className="text-xl font-bold text-primary">
                          ₦360,000/month
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Based on active providers
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              ref={statsRef}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {[
                {
                  value: "₦90k+",
                  label: "Average Weekly Earnings",
                  icon: PiggyBank,
                },
                { value: "95%", label: "Payment Success Rate", icon: Shield },
                { value: "24/7", label: "Flexible Schedule", icon: Clock },
                { value: "10k+", label: "Active Clients", icon: Users },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={fadeInUp}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-primary/5 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="font-semibold text-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Earning in 4 Easy Steps
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of providers who are already earning with Choriad
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="relative group"
                  >
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent -translate-y-1/2" />
                    )}

                    <Card className="h-full border-primary/10 bg-white overflow-hidden group-hover:shadow-xl transition-all duration-300">
                      {/* Pattern Background */}
                      <div
                        className={`relative h-48 overflow-hidden bg-gradient-to-br ${step.gradient}`}
                      >
                        <Pattern type={step.pattern} />

                        {/* Number Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.1 + 0.2,
                            type: "spring",
                          }}
                          className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary text-lg font-bold shadow-lg"
                        >
                          {step.number}
                        </motion.div>

                        {/* Icon */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="absolute bottom-4 right-4"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </motion.div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-3">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Earning Opportunities with Images */}
        <section className="py-20">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Your Earning Potential</h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Choose from a variety of services in high demand
      </p>
    </motion.div>
    
    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {earningCategories.map((category, index) => {
        return (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card className="h-full border-primary/10 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Pattern Header with Gradient */}
              <div className={`relative h-48 bg-gradient-to-br ${category.gradient} overflow-hidden`}>
                <Pattern type={category.pattern} />
                
                {/* Category Title */}
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{category.title}</h3>
                  <div className="h-1 w-16 bg-white/60 rounded-full mt-2"></div>
                </div>
                
                {/* Animated floating circles */}
                <motion.div
                  animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/30"
                />
                <motion.div
                  animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/20"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {category.services.map((service, serviceIndex) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: serviceIndex * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{service.name}</h4>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {service.rate}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  </div>
</section>

        {/* Benefits Section with Images */}
        <section className="py-20">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Providers Love Choriad</h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Join a platform designed to help you succeed
      </p>
    </motion.div>
    
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {benefits.map((benefit, index) => {
        const Icon = benefit.icon;
        return (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <Card className="h-full border-primary/10 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Pattern Header */}
              <div className={`relative h-32 ${benefit.bgColor} overflow-hidden`}>
                <Pattern type={benefit.pattern} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                  >
                    <Icon className={`h-8 w-8 ${benefit.color}`} />
                  </motion.div>
                </div>
                
                {/* Animated background elements */}
                <motion.div
                  animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"
                />
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  </div>
</section>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-none bg-gradient-to-r from-primary via-primary/90 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-white/30" />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white" />
                  <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-emerald-400" />
                </div>

                <CardContent className="p-12 text-center relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"
                  />

                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Start Your Earning Journey?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Join thousands of providers already earning extra income on
                    their own terms.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      disabled={isLoading}
                      className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    >
                      {isLoading ? "Loading..." : "Start Earning Now"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      <span>No setup fees</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      <span>Direct bank payment</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                      <span>24/7 support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

// Add Play icon component
function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );
}
