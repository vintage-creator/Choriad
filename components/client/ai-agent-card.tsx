"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function AIAgentCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-lg"
    >
      <Card className="relative overflow-visible border-primary/20 bg-gradient-to-br from-primary/6 via-primary/4 to-white shadow-lg hover:shadow-xl transition-all duration-300">
        {/* decorative glow behind the card - non-interactive and behind content */}
        <div className="pointer-events-none -z-10 absolute inset-0 rounded-xl bg-primary/10 blur-3xl" />

        <CardHeader className="px-6 pt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" aria-hidden />
              </div>
            </div>

            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Choriad AI — Your Oga
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Let AI find and book the perfect provider for you
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" aria-hidden />
              </div>
              <div className="text-sm">
                <div className="font-medium text-foreground">Smart Matching</div>
                <p className="text-muted-foreground mt-1">AI analyzes 20+ factors to find your ideal provider</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" aria-hidden />
              </div>
              <div className="text-sm">
                <div className="font-medium text-foreground">Time Saver</div>
                <p className="text-muted-foreground mt-1">Complete booking in minutes, not hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" aria-hidden />
              </div>
              <div className="text-sm">
                <div className="font-medium text-foreground">Hassle-Free</div>
                <p className="text-muted-foreground mt-1">AI handles scheduling, payments, and confirmations</p>
              </div>
            </div>
          </div>

          <div>
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-br from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md h-12 text-base"
            >
              <Link href="/client/ai-agent" aria-label="Start conversation with Choriad AI — Your Oga" className="flex items-center justify-center gap-2">
                <MessageCircle className="mr-1 h-4 w-4 text-white" />
                <span>Start Conversation</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
