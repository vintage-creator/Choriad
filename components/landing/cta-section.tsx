"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Bot, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-44 h-44 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-44 h-44 bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center bg-gradient-to-br from-white to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/10 backdrop-blur-md shadow-xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          aria-labelledby="cta-heading"
        >
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.36 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 border border-primary/20">
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>Choriad — Your Oga</span>
            </div>
          </motion.div>

          <motion.h2
            id="cta-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            viewport={{ once: true }}
          >
            Ready to let Oga handle your tasks?
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
            viewport={{ once: true }}
          >
            Join people across the city who let Choriad find, vet and manage local help — from market runs to repairs. Save time and get work done with a trusted local Oga.
          </motion.p>

          {/* highlights grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.45 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-primary/10">
              <span className="text-xl">🤖</span>
              <span className="text-sm font-medium text-foreground">Autonomous task handling</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-primary/10">
              <span className="text-xl">₦</span>
              <span className="text-sm font-medium text-foreground">We negotiate fair prices</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-primary/10">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-medium text-foreground">Fast provider matching</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-6 w-full"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56, duration: 0.45 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              asChild
              className="text-base h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg transition-transform duration-200 hover:scale-105"
              aria-label="Ask Oga to help"
            >
              <Link href="/auth/sign-up" className="flex items-center gap-3 justify-center">
                <Bot className="h-5 w-5" />
                <span>Ask Oga to help</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base h-12 sm:h-14 px-6 sm:px-8 border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary"
              aria-label="Become a verified provider"
            >
              <Link href="/provider-signup" className="flex items-center gap-3 justify-center">
                <Sparkles className="h-5 w-5" />
                <span>Become a verified provider</span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
