"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import type { AgentChatMessage } from "@/app/api/agent/chat/route"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Sparkles, User, Bot } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function AIAgentPage() {
  const [userId, setUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    async function getUser() {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  const { messages, sendMessage, status } = useChat<AgentChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/agent/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Hello! I'm your Choraid AI Agent. I can help you find and book trusted service providers automatically. Just tell me what you need help with - for example:\n\n• 'I need someone to clean my apartment in Lekki this Saturday'\n• 'Find me a plumber in Abuja for tomorrow'\n• 'I need grocery shopping help in Port Harcourt'\n\nI'll search for qualified workers, check their availability, and book them for you!",
          },
        ],
      },
    ],
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    // Inject userId into the message for the agent to use
    const messageWithContext = `${inputValue}\n\n[Client ID: ${userId}]`
    sendMessage({ text: messageWithContext })
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex items-center gap-3 py-4 mx-auto max-w-4xl">
          <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Choraid AI Agent</h1>
            <p className="text-muted-foreground text-sm">Your autonomous booking assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-6 mx-auto space-y-4 max-w-4xl">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <Card
                className={`p-4 max-w-[80%] ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div key={index} className="whitespace-pre-wrap text-pretty">
                          {part.text}
                        </div>
                      )

                    case "tool-searchWorkers":
                      switch (part.state) {
                        case "input-available":
                          return (
                            <div key={index} className="text-muted-foreground text-sm">
                              🔍 Searching for workers with skills: {part.input.skills.join(", ")} in{" "}
                              {part.input.location}...
                            </div>
                          )
                        case "output-available":
                          return (
                            <div key={index} className="space-y-2 text-sm">
                              <div className="font-medium text-green-600">✓ {part.output.message}</div>
                              {part.output.workers.length > 0 && (
                                <div className="space-y-1">
                                  {part.output.workers.map((worker: any) => (
                                    <div key={worker.id} className="p-2 rounded bg-muted/50">
                                      <div className="font-medium">{worker.name}</div>
                                      <div className="text-muted-foreground text-xs">
                                        ⭐ {worker.rating} • ₦{worker.hourlyRate}/hr • {worker.completedJobs} jobs
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                      }
                      break

                    case "tool-createBooking":
                      switch (part.state) {
                        case "input-available":
                          return (
                            <div key={index} className="text-muted-foreground text-sm">
                              📅 Creating booking for: {part.input.jobTitle}...
                            </div>
                          )
                        case "output-available":
                          return (
                            <div key={index} className="space-y-2">
                              <div className={`font-medium ${part.output.success ? "text-green-600" : "text-red-600"}`}>
                                {part.output.success ? "✓" : "✗"} {part.output.message}
                              </div>
                              {part.output.success && (
                                <div className="text-sm">
                                  <div>Booking ID: #{part.output.bookingId}</div>
                                  <div>Job ID: #{part.output.jobId}</div>
                                </div>
                              )}
                            </div>
                          )
                      }
                      break

                    case "tool-checkWorkerAvailability":
                      switch (part.state) {
                        case "input-available":
                          return (
                            <div key={index} className="text-muted-foreground text-sm">
                              📆 Checking availability for {part.input.date}...
                            </div>
                          )
                        case "output-available":
                          return (
                            <div key={index} className="text-sm">
                              {part.output.available ? "✓" : "✗"} {part.output.message}
                            </div>
                          )
                      }
                      break

                    case "tool-getClientPreferences":
                      switch (part.state) {
                        case "input-available":
                          return (
                            <div key={index} className="text-muted-foreground text-sm">
                              👤 Analyzing your preferences...
                            </div>
                          )
                      }
                      break
                  }
                  return null
                })}
              </Card>

              {message.role === "user" && (
                <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {status === "in_progress" && (
            <div className="flex gap-3">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card">
        <div className="container py-4 mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what you need help with..."
              className="flex-1 px-4 py-2 rounded-md border bg-background"
              disabled={status === "in_progress"}
            />
            <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()}>
              {status === "in_progress" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          <p className="mt-2 text-muted-foreground text-xs">
            The AI agent will autonomously search for workers and create bookings based on your needs.
          </p>
        </div>
      </div>
    </div>
  )
}
