"use client";

import {
  MessageCircle,
  Bot,
  Handshake,
  CheckCircle,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { useInView, motion } from "framer-motion";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const steps = [
  {
    icon: MessageCircle,
    title: "Describe the task",
    description: "Tell oga choriad what you need done.",
    aiAction: "Creates a clear task plan",
    color: "bg-primary/10",
    time: "2 min",
  },
  {
    icon: Bot,
    title: "We find artisans",
    description: "Searches verified local providers.",
    aiAction: "Matches by skill, rating and location",
    color: "bg-primary/10",
    time: "3 min",
  },
  {
    icon: Handshake,
    title: "We negotiate",
    description: "We agree price, schedule and terms.",
    aiAction: "Secures best available offer",
    color: "bg-primary/10",
    time: "4 min",
  },
  {
    icon: CheckCircle,
    title: "Job completes",
    description: "Track, approve and pay after work is done.",
    aiAction: "Monitors quality, releases payment",
    color: "bg-primary/10",
    time: "Varies",
  },
];

const aiCapabilities = [
  {
    icon: Shield,
    title: "Verified artisans",
    description: "Checks IDs, reviews and completion rates.",
    metric: "99%",
    metricLabel: "Verified",
  },
  {
    icon: Zap,
    title: "Fast matching",
    description: "Finds a good match in seconds.",
    metric: "45s",
    metricLabel: "Avg. match time",
  },
  {
    icon: Clock,
    title: "Time saved",
    description: "We handle search, vetting and negotiation.",
    metric: "2–3h",
    metricLabel: "Saved / task",
  },
];

export function HowItWorksSection() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeStep, setActiveStep] = useState(0);

  const handleGetOgaHelp = async () => {
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/client/ai-agent");
    } else {
      router.push("/auth/login");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as any },
    },
  };

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-24 bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground">
            How the AI agent works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We find, verify and arrange local help — you approve and relax.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: Capabilities (full-height column) */}
          <motion.div
            className="h-full flex flex-col justify-between"
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-medium text-foreground mb-6">
                Why choose choriad
              </h3>

              <div className="space-y-4">
                {aiCapabilities.map((cap, i) => (
                  <motion.div
                    key={cap.title}
                    className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <cap.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                          {cap.title}
                        </h4>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-semibold text-primary">
                            {cap.metric}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cap.metricLabel}
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cap.description}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-center mt-4 sm:mt-6">
                  <div
                    className="hidden sm:flex flex-col items-center gap-2"
                    aria-hidden="true"
                  >
                    <motion.svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: [0, 6, 0], opacity: [0, 1, 1] }}
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 0.8,
                        duration: 1.2,
                      }}
                      className="stroke-primary"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>

                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ y: 0, opacity: 0.9 }}
                      animate={{ y: [0, 8, 0], opacity: [0.9, 1, 0.9] }}
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        duration: 1.4,
                        delay: 0.2,
                      }}
                      className="stroke-primary/80"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 9l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </div>
                </div>
              </div>
            </div>

            {/* stats sit at the bottom so left column visually matches right column */}
            <div className="mt-6 grid grid-cols-2 gap-4 p-4 rounded-xl bg-primary text-white">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold">2,500+</div>
                <div className="text-sm opacity-90">Tasks handled</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold">₦2.3M+</div>
                <div className="text-sm opacity-90">Saved for clients</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Steps */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="h-full flex flex-col"
          >
            <div className="flex-1 space-y-4 overflow-hidden">
              {steps.map((step, index) => {
                const active = activeStep === index;
                return (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    onMouseEnter={() => setActiveStep(index)}
                    onClick={() => setActiveStep(index)}
                    className={`flex gap-4 p-4 sm:p-5 rounded-xl border transition-shadow duration-150 cursor-pointer ${
                      active
                        ? "border-primary/20 bg-white shadow"
                        : "border-gray-100 bg-white"
                    }`}
                    role="button"
                    aria-pressed={active}
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg ${step.color}`}
                    >
                      <step.icon className={`h-5 w-5 text-primary`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-md font-semibold text-foreground">
                          {step.title}
                        </h4>
                        <div
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          Step {index + 1}
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <div className="text-sm text-green-700 font-medium">
                          AI: {step.aiAction}
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {step.time}
                        </div>
                      </div>

                      {active && (
                        <motion.div
                          className="mt-3 w-full bg-gray-200 rounded-full h-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="bg-primary h-2 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.8 }}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA pinned at bottom for visual parity with left stats */}
            <div className="mt-4">
              <div className="text-center p-4 bg-white border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-foreground mb-1">
                  Ready for help?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask Oga to handle it — we’ll find, book and manage the work
                  for you.
                </p>
                <Button
                  aria-label="Get Oga to help"
                  onClick={handleGetOgaHelp}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-6 py-2 rounded-md"
                >
                  Get Oga to help
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
