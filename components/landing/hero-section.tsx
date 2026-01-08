// hero-section.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CountUp({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [currentCity, setCurrentCity] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const cities = [
    "Lagos",
    "Abia",
    "Imo",
    "Abuja",
    "Delta",
    "Akwa Ibom",
    "Rivers",
    "Cross River",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCity((prev) => (prev + 1) % cities.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY <= 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFindHelper = async () => {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      // User is logged in → go to dashboard
      router.push("/client/dashboard");
    } else {
      // Not logged in → sign up
      router.push("/auth/sign-up");
    }
  };

  const handleOpenDemoModal = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeDemoModal = () => {
    setShowModal(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && showModal) {
        closeDemoModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  // Demo conversation shown inside laptop mock
  const demoMessages = [
    { role: "assistant", text: "I found 3 verified plumbers near you. Shall I compare their rates?" },
    { role: "user", text: "Yes — compare and book the cheapest for tomorrow afternoon." },
    { role: "assistant", text: "Done. Booked Tunde Plumbing for ₦15,000 — ETA 2 PM. Want me to confirm?" },
  ];

  const messageVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.32, duration: 0.38 } }),
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-slate-50 to-background pt-16 pb-12 md:pt-24 md:pb-20">
      {/* Soft decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-8 w-28 h-28 bg-primary/10 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute bottom-36 right-8 w-36 h-36 bg-emerald-500/8 rounded-full blur-3xl hidden md:block" />
        <div className="absolute -top-36 -right-36 w-72 h-72 rounded-full blur-3xl bg-primary/6" />
        <div className="absolute -bottom-36 -left-36 w-72 h-72 rounded-full blur-3xl bg-emerald-50/6" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column: copy + CTAs */}
          <motion.div
            className="max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 mt-4 md:mb-8 border border-primary/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Choriad — your local Agentic AI</span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
            >
              Your Personal
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                {" "}
                Oga
              </span>
              <br />
              for Everyday Tasks
            </motion.h1>

            <motion.div
              className="flex items-center gap-3 mb-4 text-base md:text-lg text-muted-foreground"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <MapPin className="h-5 w-5 text-primary" />
              <span>Now working in</span>
              <motion.span
                key={currentCity}
                className="font-semibold text-primary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {" "}
                {cities[currentCity]}
              </motion.span>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              Choriad goes out, finds trusted artisans, bargains for a fair
              price, books the appointment and handles payment — you relax and
              carry on with your day.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <Button
                size="lg"
                onClick={handleFindHelper}
                className="text-base h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  Find my helper
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 sm:h-14 px-6 sm:px-8 border-2 border-primary/30 bg-transparent hover:bg-primary/5 transition-all duration-300"
                onClick={handleOpenDemoModal}
              >
                <span className="flex items-center gap-2 text-primary cursor-pointer">
                  <Play className="h-4 w-4" />
                  See Oga at work
                </span>
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-3 sm:grid-cols-3 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[
                { number: 500, suffix: "+", label: "Verified Artisans" },
                { number: 2500, suffix: "+", label: "Jobs Done" },
                { number: 4.9, suffix: "★", label: "Happy Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-primary/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.15 + index * 0.12 }}
                >
                  <div className="text-lg sm:text-2xl font-bold text-primary">
                    <CountUp end={stat.number} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column: laptop mockup thumbnail */}
          <motion.div
            className="relative mx-auto w-full max-w-xl"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-primary/20 bg-white cursor-pointer"
              role="button"
              aria-label="Open demo"
              onClick={() => handleOpenDemoModal()}
            >
              {/* Laptop frame */}
              <div className="aspect-[16/10] relative">
                <Image src="/see-oga.png" alt="Laptop mockup" fill style={{ objectFit: "cover" }} />

                {/* subtle overlay CTA */}
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 bg-white/90 text-primary px-3 py-2 rounded-full shadow pointer-events-none">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">See Oga at work</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-2xl blur-xl hidden sm:block" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-500/10 rounded-2xl blur-xl hidden sm:block" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            onClick={closeDemoModal}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* modal content */}
            <motion.div
              className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* laptop frame */}
              <div className="relative aspect-[16/10] bg-gray-100">
                <Image src="/watch-oga.jpg" alt="Laptop mockup" fill style={{ objectFit: "cover" }} />

                {/* screen area container (positioned inside laptop frame) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[78%] h-[74%] bg-white/95 rounded-xl shadow-inner p-4 flex flex-col">
                    {/* header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">Choriad AI</div>
                          <div className="text-xs text-muted-foreground">Agentic assistant</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Conversation demo</div>
                    </div>

                    {/* messages area */}
                    <div className="flex-1 overflow-auto py-2 space-y-3" aria-live="polite">
                      {demoMessages.map((m, i) => (
                        <motion.div
                          key={i}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={messageVariants}
                          className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm ${
                            m.role === "assistant"
                              ? "self-start bg-white text-foreground"
                              : "self-end bg-primary/90 text-white"
                          }`}
                          style={{ alignSelf: m.role === "assistant" ? "flex-start" : "flex-end" }}
                        >
                          <div className="text-sm leading-snug">{m.text}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* booking card (appears after messages) */}
                    <motion.div
                      className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3 shadow-sm"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: demoMessages.length * 0.32 + 0.2 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold">Tunde Plumbing</div>
                          <div className="text-xs text-muted-foreground mt-1">Booked — ₦15,000 • Tomorrow, 2 PM</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-emerald-700">Confirmed</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-3">
                        <Button size="sm" className="px-3 py-1">View booking</Button>
                        <Button size="sm" variant="outline" className="px-3 py-1">Message provider</Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* close */}
              <div className="absolute top-3 right-3">
                <button
                  className="rounded-full bg-white/90 p-2 shadow hover:bg-white cursor-pointer"
                  onClick={closeDemoModal}
                  aria-label="Close demo"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
