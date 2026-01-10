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
  PiggyBank,
  MapPin,
  Star,
  Briefcase,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast"
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
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Finding the best providers..."
  );

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
              text: "👋 Hello! I'm your **Choriad AI Agent**. I'll help you find and book the perfect service provider for your needs.\n\nTo get you the best match, I'll ask a few questions about:\n\n📍 **Location & Timing** - Where do you need the service?\n\n💰 **Budget & Preferences** - What's your budget range?\n\n🎯 **Specific Requirements** - Any special requirements?\n\n**What would you like help with today?**",
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

  useEffect(() => {
    if (!userId) return;
  
    const supabase = createBrowserClient();
  
    // ✅ Subscribe to booking_request updates for this client
    const channel = supabase
      .channel('ai-agent-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'booking_requests',
          filter: `client_id=eq.${userId}`
        },
        async (payload) => {
          const updatedRequest = payload.new;
          console.log("Booking request updated:", updatedRequest);
  
          // Check if worker accepted/countered/rejected
          if (updatedRequest.status === 'accepted') {
            // ✅ AUTO-CONTINUE: Inject message from AI agent
            const autoMessage = {
              id: `auto-${Date.now()}`,
              role: 'assistant' as const,
              parts: [{
                type: 'text',
                text: `🎉 **Great news!** The worker just accepted your booking request!\n\nTo complete the booking, you need to make the payment:\n\n✅ Amount: ₦${updatedRequest.proposed_amount_ngn?.toLocaleString()}\n💳 [Click here to pay](/client/booking-requests/${updatedRequest.id}/pay)\n\nYour payment is protected by escrow - the worker only gets paid after you approve the completed work.`
              }]
            };
  
            setMessages(prev => [...prev, autoMessage]);
            
            // Auto-scroll to new message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
  
            // Show toast notification
            toast.success("Worker accepted your request!", {
              duration: 6000,
              icon: "🎉"
            });
          }
  
          if (updatedRequest.status === 'countered') {
            // ✅ AUTO-CONTINUE: Worker sent counter-offer
            const autoMessage = {
              id: `auto-${Date.now()}`,
              role: 'assistant' as const,
              parts: [{
                type: 'text',
                text: `💬 **The worker sent a counter-offer:**\n\n📊 Your offer: ₦${updatedRequest.proposed_amount_ngn?.toLocaleString()}\n📊 Worker's counter-offer: ₦${updatedRequest.counter_offer_ngn?.toLocaleString()}\n${updatedRequest.counter_note ? `\n💭 Worker's note: "${updatedRequest.counter_note}"\n` : ''}\nWould you like to:\n1️⃣ Accept the counter-offer (₦${updatedRequest.counter_offer_ngn?.toLocaleString()})\n2️⃣ Decline and see other workers\n\nWhat would you prefer?`
              }]
            };
  
            setMessages(prev => [...prev, autoMessage]);
            toast("Worker sent a counter-offer", {
              icon: <Info />,      
              duration: 5000,
            });
          }
  
          if (updatedRequest.status === 'rejected') {
            // ✅ AUTO-CONTINUE: Worker rejected
            const autoMessage = {
              id: `auto-${Date.now()}`,
              role: 'assistant' as const,
              parts: [{
                type: 'text',
                text: `❌ Unfortunately, the worker declined your booking request.\n\nNo worries! I found 2 other great workers in the same area who are available:\n\n🔍 Would you like me to show you alternative workers?`
              }]
            };
  
            setMessages(prev => [...prev, autoMessage]);
            toast.error("Worker declined request", {
              duration: 5000,
            });
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setMessages]);

  // Simple intent-based loading message selector
  function getLoadingMessageForInput(text: string, msgs: Message[]) {
    const s = (text || "").toLowerCase();
    // keywords
    const providerKeywords = [
      "find",
      "search",
      "providers",
      "provider",
      "plumber",
      "cleaner",
      "handyman",
      "worker",
      "need",
      "find me",
    ];
    const bookingKeywords = [
      "book",
      "availability",
      "schedule",
      "confirm",
      "booking",
    ];
    const priceKeywords = [
      "price",
      "cost",
      "budget",
      "how much",
      "quote",
      "estimate",
    ];
    const fallbackOptions = [
      "Thinking...",
      "Working on it...",
      "Crunching results...",
    ];

    if (providerKeywords.some((k) => s.includes(k))) {
      return "Finding the best providers...";
    }
    if (bookingKeywords.some((k) => s.includes(k))) {
      return "Checking availability...";
    }
    if (priceKeywords.some((k) => s.includes(k))) {
      return "Thinking...";
    }

    // check recent assistant parts for tools
    const lastAssistant = [...msgs]
      .reverse()
      .find((m) => m.role === "assistant");
    const lastPartType = lastAssistant?.parts?.[0]?.type ?? "";
    if (
      typeof lastPartType === "string" &&
      lastPartType.includes("tool-searchWorkers")
    ) {
      return "Finding the best providers...";
    }

    return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
  }

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

    // compute loading message now
    const chosen = getLoadingMessageForInput(inputValue, [
      ...messages,
      userMessage,
    ]);
    setLoadingMessage(chosen);

    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: userId, // ← ADDED: Pass user ID to API
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

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
              text: `⚠️ Sorry, I encountered an error: ${
                error instanceof Error ? error.message : "Unknown error"
              }. Please try again or rephrase your request.`,
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
      // reset loading message to default
      setLoadingMessage("Finding the best providers...");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!userId || isLoading) return;
    setInputValue(question);
    setTimeout(() => {
      const form = document.querySelector("form");
      form?.requestSubmit();
    }, 100);
  };

  const suggestedQuestions = [
    "I need a cleaner for my 3-bedroom apartment in Lekki this Saturday",
    "Find me a reliable plumber in Ajah for urgent repairs",
    "I need grocery shopping help in Ajah, Lagos tomorrow. Budget is ₦25,000",
    "Looking for a handyman for furniture assembly in Victoria Island",
  ];

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading AI Agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <DashboardHeader profile={profile} />

      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-slate-100 -ml-2"
              >
                <Link
                  href="/client/dashboard"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Back</span>
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-base sm:text-lg">
                    AI Booking Agent
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Powered by Vintage
                  </p>
                </div>
              </div>
            </div>

            {profile && (
              <div className="hidden md:flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
                <span className="text-sm text-muted-foreground truncate max-w-xs">
                  {profile.full_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto w-full py-6 space-y-4 px-4 sm:px-6 lg:px-8">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className={`flex gap-3 sm:gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`flex-1 max-w-[85%] sm:max-w-[75%] ${
                    message.role === "user" ? "order-first" : ""
                  }`}
                >
                  <Card
                    className={`border shadow-sm transition-all hover:shadow-md ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-blue-600 text-white border-primary/20"
                        : "bg-white/95 backdrop-blur-sm border-slate-200"
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
                                  ? "prose-invert text-white [&_strong]:text-white"
                                  : "prose-slate [&_strong]:text-slate-900"
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
                            const output = part.output || {};
                            const workers = Array.isArray(output.workers)
                              ? output.workers
                              : [];
                            const success = output.success;

                            return (
                              <div key={partIndex} className="space-y-4 mt-2">
                                <div
                                  className={`flex items-center gap-2 font-medium text-sm ${
                                    success
                                      ? "text-green-600"
                                      : "text-amber-600"
                                  }`}
                                >
                                  {success ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span>
                                    {success
                                      ? `Found ${
                                          workers.length
                                        } matching provider${
                                          workers.length !== 1 ? "s" : ""
                                        }`
                                      : output.message || "No matches found"}
                                  </span>
                                </div>

                                {workers.length > 0 && (
                                  <div className="grid gap-3">
                                    {workers.map((worker: any, idx: number) => (
                                      <motion.div
                                        key={worker?.id ?? idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                      >
                                        <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 hover:shadow-lg transition-all">
                                          <CardContent className="p-4">
                                            <div className="space-y-3">
                                              {/* Header */}
                                              <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1 flex-1 min-w-0">
                                                  <div className="font-semibold text-base text-slate-900 flex items-center gap-2 flex-wrap">
                                                    <span className="truncate">
                                                      {worker?.name ??
                                                        "Unknown"}
                                                    </span>
                                                    {worker?.verified && (
                                                      <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-700 text-xs"
                                                      >
                                                        ✓ Verified
                                                      </Badge>
                                                    )}
                                                    {worker?.isNewWorker && (
                                                      <Badge
                                                        variant="secondary"
                                                        className="bg-purple-100 text-purple-700 text-xs"
                                                      >
                                                        🆕 New
                                                      </Badge>
                                                    )}
                                                  </div>

                                                  {/* Location */}
                                                  {(worker?.location ||
                                                    worker?.locationArea) && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                      <span className="truncate">
                                                        {worker?.location ||
                                                          (worker?.locationArea &&
                                                          worker?.locationCity
                                                            ? `${worker.locationArea}, ${worker.locationCity}`
                                                            : worker?.locationArea ||
                                                              worker?.locationCity)}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>

                                                <Badge
                                                  variant="outline"
                                                  className="bg-green-600 text-white border-green-700 text-xs whitespace-nowrap"
                                                >
                                                  {worker?.matchScore ?? 0}%
                                                  Match
                                                </Badge>
                                              </div>

                                              {/* Stats Grid */}
                                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-green-200/50">
                                                <div className="flex items-center gap-1.5">
                                                  <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                    <div className="text-xs font-medium text-slate-900">
                                                      {worker?.rating > 0
                                                        ? worker.rating.toFixed(
                                                            1
                                                          )
                                                        : worker?.isNewWorker
                                                        ? "New"
                                                        : "-"}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                      {worker?.totalReviews > 0
                                                        ? `(${worker.totalReviews} reviews)`
                                                        : "(No reviews)"}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                  <PiggyBank className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                    <div className="text-xs font-medium text-slate-900 truncate">
                                                      {worker?.hourlyRate > 0
                                                        ? `₦${worker.hourlyRate.toLocaleString()}`
                                                        : "Negotiable"}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                      {worker?.hourlyRate > 0
                                                        ? "per hour"
                                                        : "contact for rate"}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                  <Briefcase className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                    <div className="text-xs font-medium text-slate-900">
                                                      {worker?.completedJobs ??
                                                        0}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                      completed
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                  <Calendar className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                                  <div className="min-w-0">
                                                    <div className="text-xs font-medium text-green-700">
                                                      Available
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">
                                                      {worker?.availability
                                                        ?.length ?? 0}{" "}
                                                      days
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Skills */}
                                              {Array.isArray(worker?.skills) &&
                                                worker.skills.length > 0 && (
                                                  <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {worker.skills
                                                      .slice(0, 4)
                                                      .map(
                                                        (
                                                          skill: string,
                                                          i: number
                                                        ) => (
                                                          <Badge
                                                            key={i}
                                                            variant="secondary"
                                                            className="bg-white/80 text-slate-700 text-xs"
                                                          >
                                                            {skill}
                                                          </Badge>
                                                        )
                                                      )}
                                                    {worker.skills.length >
                                                      4 && (
                                                      <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                      >
                                                        +
                                                        {worker.skills.length -
                                                          4}{" "}
                                                        more
                                                      </Badge>
                                                    )}
                                                  </div>
                                                )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }

                        if (partType === "tool-negotiatePrice") {
                          if (part.state === "output-available") {
                            const output = part.output || {};
                            return (
                              <div key={partIndex} className="space-y-3 mt-2">
                                <Card className="border border-blue-200 bg-blue-50/50">
                                  <CardContent className="p-3">
                                    <div className="text-sm space-y-2">
                                      <div className="font-medium text-blue-900">
                                        💰 Price Negotiation
                                      </div>
                                      <div className="text-xs text-slate-700">
                                        {output.message}
                                      </div>
                                      {output.agreedPrice && (
                                        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                          <span className="text-xs text-muted-foreground">
                                            Proposed Price:
                                          </span>
                                          <span className="font-semibold text-blue-700">
                                            ₦
                                            {output.agreedPrice.toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            );
                          }
                        }

                        if (partType === "tool-createBookingWithPayment") {
                          if (part.state === "output-available") {
                            const output = part.output || {};
                            return (
                              <div key={partIndex} className="space-y-3 mt-2">
                                <div
                                  className={`flex items-center gap-2 font-medium text-sm ${
                                    output.success
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {output.success ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span>{output.message}</span>
                                </div>

                                {output.success && (
                                  <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-green-800">
                                          🎉 Booking Confirmed!
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="bg-white"
                                        >
                                          #{output.bookingId?.slice(0, 8)}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <div className="text-muted-foreground">
                                            Total Amount
                                          </div>
                                          <div className="font-semibold text-slate-900">
                                            ₦
                                            {output.agreedAmount?.toLocaleString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-muted-foreground">
                                            Worker Gets
                                          </div>
                                          <div className="font-semibold text-green-700">
                                            ₦
                                            {output.workerPayout?.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>

                                      {output.paymentUrl && (
                                        <Button
                                          asChild
                                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                          size="sm"
                                        >
                                          <Link href={output.paymentUrl}>
                                            Proceed to Payment →
                                          </Link>
                                        </Button>
                                      )}
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
                            className="text-xs text-muted-foreground bg-slate-100 rounded p-2 overflow-auto max-h-40"
                          >
                            <pre className="whitespace-pre-wrap text-[10px]">
                              {JSON.stringify(part, null, 2)}
                            </pre>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <Card className="border-0 shadow-sm bg-white/95 backdrop-blur-sm flex-1 max-w-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
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
                    <span aria-live="polite">{loadingMessage}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 pt-4"
            >
              <p className="text-sm text-muted-foreground text-center font-medium">
                💡 Try asking:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <motion.button
                    key={question}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="text-left p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md hover:border-primary/30 transition-all duration-200 text-sm text-slate-700 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="line-clamp-2 group-hover:text-primary transition-colors">
                      {question}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/95 backdrop-blur-sm shadow-lg sticky bottom-0">
        <div className="max-w-5xl mx-auto w-full py-4 px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isLoading
                      ? "AI assistant is thinking..."
                      : "Describe your task (e.g., 'I need a personal shopper in Ajah for grocery shopping this Saturday, budget ₦25k')"
                  }
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-50 text-sm placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-full sm:w-auto px-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              💡 <strong>Tip:</strong> Be specific about location, timing,
              budget, and special requirements for better matches
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
