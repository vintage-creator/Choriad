// app/client/ai-agent/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  User,
  ArrowLeft,
  Bot,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/client/dashboard-header";
import Link from "next/link";
import type { Profile } from "@/lib/types";

type MessagePart = {
  type: string;
  text?: string;
  state?: string;
  input?: any;
  output?: any;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
};

export default function AIAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // read query params
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auth & profile check
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoadingAuth(true);
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        if (!mounted) return;
        setUserId(user.id);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Failed to fetch profile:", error);
        } else {
          if (!mounted) return;
          setProfile(profileData as Profile);
          if ((profileData as Profile)?.user_type !== "client") {
            router.push("/worker/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Hello! I'm your Choriad AI Agent. I'll help you find and book the perfect service provider for your needs.\n\nTo get you the best match, I'll ask a few questions about:\n\n📍 **Location & Timing**\n\n💰 **Budget & Preferences** \n\n🎯 **Specific Requirements**\n\nWhat would you like help with today?",
            },
          ],
        },
      ]);
    }
  }, []);

  // Pre-fill inputValue if ?service= is present
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      setInputValue(`I need help with ${decodeURIComponent(serviceParam)}`);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !userId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text: inputValue }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stream: false,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        setMessages((prev) => [...prev, ...data.messages]);
      } else if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Sorry, I encountered an error. Please try again.",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!userId || isLoading) return;
    setInputValue(question); // Auto-submit
    setTimeout(() => {
      const form = document.querySelector("form");
      form?.requestSubmit();
    }, 100);
  };

  const suggestedQuestions = [
    "I need a cleaner for my 3-bedroom apartment in Lekki this Saturday",
    "Find me a reliable plumber in Abuja for a leaky faucet",
    "I need grocery shopping help in Port Harcourt tomorrow",
    "Looking for a handyman for furniture assembly in Victoria Island",
  ];

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <DashboardHeader profile={profile} />

      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link
                href="/client/dashboard"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </Button>

            {profile && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Online
                </Badge>
                <span className="truncate max-w-xs">{profile.full_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl py-6 space-y-6 px-4 sm:px-6 lg:px-8">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`w-full sm:max-w-[80%] ${
                    message.role === "user" ? "order-first" : ""
                  }`}
                >
                  <Card
                    className={`border-0 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-blue-600 text-white"
                        : "bg-white/90 backdrop-blur-sm"
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      {message.parts.map((part, partIndex) => {
                        const partType = part?.type ?? "text";

                        if (partType === "text") {
                          return (
                            <div
                              key={partIndex}
                              className={`prose prose-sm sm:prose-base max-w-none leading-relaxed ${
                                message.role === "user"
                                  ? "prose-invert text-white"
                                  : "prose-slate"
                              }`}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part?.text ?? ""}
                              </ReactMarkdown>
                            </div>
                          );
                        }

                        if (partType === "tool-searchWorkers") {
                          if (part.state === "output-available") {
                            const workers = Array.isArray(part.output?.workers)
                              ? part.output.workers
                              : [];
                            return (
                              <div key={partIndex} className="space-y-4">
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Found {workers.length} matching providers
                                </div>
                                {workers.length > 0 && (
                                  <div className="grid gap-3">
                                    {workers.map((worker: any) => (
                                      <Card
                                        key={worker?.id ?? Math.random()}
                                        className="border border-green-200 bg-green-50/50"
                                      >
                                        <CardContent className="p-3">
                                          <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                              <div className="font-semibold text-sm">
                                                {worker?.name ?? "Unknown"}
                                              </div>
                                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                  ⭐ {worker?.rating ?? "-"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <DollarSign className="w-3 h-3" />{" "}
                                                  ₦{worker?.hourlyRate ?? "-"}
                                                  /hr
                                                </span>
                                                <span>
                                                  📊{" "}
                                                  {worker?.completedJobs ?? 0}{" "}
                                                  jobs
                                                </span>
                                              </div>
                                            </div>
                                            <Badge
                                              variant="secondary"
                                              className="bg-white text-green-700"
                                            >
                                              Available
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }

                        if (partType === "tool-createBooking") {
                          if (part.state === "output-available") {
                            return (
                              <div key={partIndex} className="space-y-3">
                                <div
                                  className={`flex items-center gap-2 font-medium ${
                                    part.output?.success
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {part.output?.success ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                                  )}
                                  {part.output?.message ?? ""}
                                </div>
                                {part.output?.success && (
                                  <Card className="border border-green-200 bg-green-50">
                                    <CardContent className="p-4">
                                      <div className="text-sm font-medium mb-2 text-green-800">
                                        Booking Confirmed!
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <div className="text-green-600">
                                            Booking ID
                                          </div>
                                          <div className="font-mono">
                                            #{part.output?.bookingId ?? "?"}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-green-600">
                                            Job ID
                                          </div>
                                          <div className="font-mono">
                                            #{part.output?.jobId ?? "?"}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            );
                          }
                        }

                        return (
                          <div
                            key={partIndex}
                            className="text-xs text-muted-foreground"
                          >
                            <pre>{JSON.stringify(part, null, 2)}</pre>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {message.role === "user" && (
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm w-full sm:max-w-md">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span>Finding the best providers...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6"
            >
              {suggestedQuestions.map((question) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left p-3 rounded-lg border border-border/50 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-200 text-sm text-muted-foreground hover:text-foreground"
                >
                  {question}
                </motion.button>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="mx-auto w-full max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isLoading
                      ? "AI assistant is finding providers..."
                      : "Describe your task (e.g., 'I need a cleaner for my 3-bedroom apartment in Lekki this Saturday')"
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 text-sm"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-full sm:w-auto px-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              💡 Be specific about location, timing, and requirements for better
              matches
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
