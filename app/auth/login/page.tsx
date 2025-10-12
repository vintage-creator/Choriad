"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { LogIn, Sparkles, Eye, EyeOff, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    // Email validation
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const { data: profile } = await supabase.from("profiles").select("user_type").single()

      if (profile?.user_type === "worker") {
        router.push("/worker/dashboard")
      } else {
        router.push("/client/dashboard")
      }
    } catch (error: unknown) {
      setErrors({ 
        general: error instanceof Error ? error.message : "An error occurred during login" 
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
                    <LogIn className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent text-center">
                      Welcome Back
                    </CardTitle>
                    <CardDescription className="text-center">
                      Sign in to your Choraid account
                    </CardDescription>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleLogin} noValidate>
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

                    <div className="grid gap-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-sm text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors duration-200"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (errors.password) {
                              setErrors(prev => ({ ...prev, password: undefined }))
                            }
                          }}
                          className={`h-12 px-4 pr-12 border-2 transition-colors duration-300 ${
                            errors.password ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary/50'
                          }`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">{errors.password}</p>
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
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link 
                        href="/auth/sign-up" 
                        className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors duration-200"
                      >
                        Create account
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}