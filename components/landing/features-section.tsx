// features-section.tsx
"use client";

import {
  ShoppingCart,
  Home,
  Car,
  Package,
  Utensils,
  Wrench,
  Heart,
  GraduationCap,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const features = [
  {
    icon: ShoppingCart,
    title: "Market Runs",
    description:
      "Get your groceries and market items delivered fresh. We know the best prices in town!",
    color: "from-green-500 to-emerald-600",
    africanTerm: "Oja Shopping",
  },
  {
    icon: Home,
    title: "Home Cleaning",
    description:
      "Professional cleaning for your home or office. Leave the dirty work to us!",
    color: "from-blue-500 to-cyan-600",
    africanTerm: "House Cleaning",
  },
  {
    icon: Car,
    title: "Errands & Deliveries",
    description:
      "Need something picked up or delivered across town? We've got you covered.",
    color: "from-orange-400 to-red-500",
    africanTerm: "Go-Come",
  },
  {
    icon: GraduationCap,
    title: "Tutorial Services",
    description:
      "Find qualified tutors for your children or personal learning goals.",
    color: "from-purple-500 to-pink-600",
    africanTerm: "Tutor",
  },
  {
    icon: Utensils,
    title: "Home Chef",
    description:
      "Enjoy delicious home-cooked meals prepared by local culinary experts.",
    color: "from-rose-500 to-red-600",
    africanTerm: "Home Cook",
  },
  {
    icon: Wrench,
    title: "Handyman Services",
    description:
      "From minor repairs to major fixes, find skilled artisans you can trust.",
    color: "from-amber-400 to-orange-500",
    africanTerm: "Handyman (Oga)",
  },
  {
    icon: Users,
    title: "Event Support",
    description:
      "Planning an occasion? Get help with setup, serving, and cleanup.",
    color: "from-indigo-500 to-purple-600",
    africanTerm: "Party Support",
  },
  {
    icon: Heart,
    title: "Elderly Care",
    description: "Compassionate caregivers for your elderly loved ones.",
    color: "from-pink-500 to-rose-600",
    africanTerm: "Caregiver",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as any },
    },
  };

  const handleRequestService = async (service: string) => {
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // User is logged in, navigate to ai-agent with service pre-filled
      router.push(`/client/ai-agent?service=${encodeURIComponent(service)}`);
    } else {
      // Not logged in, redirect to login page
      router.push("/auth/login");
    }
  };

  const handleAskOga = async () => {
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

  return (
    <section
      id="features"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-slate-50/6"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            Services for every need
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From daily chores to specialised tasks — local, verified providers
            with the personal touch you expect.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-primary/10 transition-shadow duration-200 hover:shadow-lg group">
                  <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-md mb-3`}
                      >
                        <Icon
                          className="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="mb-3">
                        <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-primary transition-colors duration-150">
                          {feature.title}
                        </h3>
                        <span className="text-xs inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                          {feature.africanTerm}
                        </span>
                      </div>

                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-5 w-full">
                      <Button
                        aria-label={`Request ${feature.title}`}
                        className="w-full text-sm py-2 rounded-md bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90 transition-colors cursor-pointer"
                        onClick={() => handleRequestService(feature.title)}
                      >
                        Request this service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Callout */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg">
            <h3 className="text-lg sm:text-2xl font-semibold mb-2">
              Don’t see what you need?
            </h3>
            <p className="text-sm sm:text-base text-white/90 mb-4 max-w-2xl mx-auto">
              Tell Oga what you need and we’ll find the right provider. Almost
              any task — we can handle it.
            </p>
            <div className="flex justify-center">
              <Button
                aria-label="Ask Oga to help"
                className="bg-white text-primary hover:bg-amber-50 shadow-md px-5 py-2 rounded-md cursor-pointer"
                onClick={handleAskOga}
              >
                Ask Oga to help
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
