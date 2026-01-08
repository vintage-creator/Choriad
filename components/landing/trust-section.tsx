// trust-section.tsx
"use client";

import { Shield, Star, Clock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Variants, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const frontContent: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  hidden: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.25 },
  },
};

const backContent: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: 0.08 },
  },
  hidden: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.2 },
  },
};

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Providers",
    description: "All service providers undergo thorough background checks and verification",
    longDescription:
      "Every provider completes identity verification, local reference checks and onboarding training. We also run periodic audits and accept client reports so our network stays reliable.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Read honest reviews from other clients before booking",
    longDescription:
      "After each job both client and provider leave feedback. Top-rated providers are promoted in search, while persistent low ratings trigger retraining and review.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    description: "Track your provider in real-time and get updates on progress",
    longDescription:
      "Providers share ETAs and live status updates for each task. Missed check-ins trigger automated reminders and escalation so you get timely service.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Pay safely through our platform with buyer protection",
    longDescription:
      "Payments are processed via secure gateways with escrow support. Funds are released after confirmed job completion, protecting both clients and providers.",
    color: "from-purple-500 to-pink-600",
  },
];

function FlipCard({ feature }: { feature: typeof trustFeatures[0] }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = feature.icon;

  return (
    <div className="w-full" style={{ perspective: 1000 }}>
      <motion.div
        className="relative w-full h-[260px] md:h-[320px] lg:h-[380px] rounded-2xl"
        style={{ transformStyle: "preserve-3d" as const }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl group">
            <CardContent className="p-8 text-center h-full flex flex-col items-center justify-start">
              <motion.div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}
                initial="hidden"
                animate={flipped ? "hidden" : "visible"}
                variants={frontContent}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>

              <motion.h3
                className="font-bold text-xl mb-4 text-foreground group-hover:text-primary transition-colors duration-300"
                initial="hidden"
                animate={flipped ? "hidden" : "visible"}
                variants={frontContent}
              >
                {feature.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground leading-relaxed"
                initial="hidden"
                animate={flipped ? "hidden" : "visible"}
                variants={frontContent}
              >
                {feature.description}
              </motion.p>
            </CardContent>
          </Card>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <div className={`w-full h-full p-0 rounded-2xl flex items-center justify-center`}>
            {/* gradient background (same as icon) */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color}`} aria-hidden />
            {/* subtle pattern overlay (radial) */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                mixBlendMode: "overlay",
                opacity: 0.9,
              }}
              aria-hidden
            />

            <motion.div
              className="relative z-10 px-6 py-8 text-center"
              initial="hidden"
              animate={flipped ? "visible" : "hidden"}
              variants={backContent}
            >
              <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-white/90 max-w-xs mx-auto">
                {feature.longDescription}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } },
  };

  return (
    <section id="trust" className="py-24 bg-gradient-to-b from-background to-muted/50">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Trust &amp; Safety First</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Your safety and satisfaction are our top priorities in every interaction</p>
        </motion.div>

        <motion.div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          {trustFeatures.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FlipCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
