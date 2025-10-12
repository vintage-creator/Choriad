"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setIsSuccess(true)
    } catch (error: unknown) {
      setErrors({ 
        general: error instanceof Error ? error.message : "An error occurred while sending reset email" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="mt-16 flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-blue-50/20 to-background">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-2xl border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-blue-50/30 p-6 border-b border-border/50">
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent text-center">
                      Reset Password
                    </CardTitle>
                    <CardDescription className="text-center">
                      {isSuccess 
                        ? "Check your email for reset instructions" 
                        : "Enter your email to receive a password reset link"
                      }
                    </CardDescription>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                      <p className="text-muted-foreground">
                        We've sent password reset instructions to <strong>{email}</strong>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button asChild className="w-full">
                        <Link href="/auth/login">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Login
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/">Go to Homepage</Link>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleResetPassword} noValidate>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (errors.email) {
                              setErrors(prev => ({ ...prev, email: undefined }))
                            }
                          }}
                          className={`h-12 px-4 border-2 transition-colors duration-300 ${
                            errors.email ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary/50'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>

                      {errors.general && (
                        <motion.div 
                          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <p className="text-sm text-destructive text-center">{errors.general}</p>
                        </motion.div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending reset link...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Send Reset Link
                          </div>
                        )}
                      </Button>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link 
                          href="/auth/login" 
                          className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors duration-200"
                        >
                          Back to login
                        </Link>
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}