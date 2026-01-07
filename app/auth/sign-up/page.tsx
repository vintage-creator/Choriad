"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { UserPlus, Sparkles, Eye, EyeOff, User, Briefcase, Check } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<"client" | "worker">("client")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [errors, setErrors] = useState<{ 
    fullName?: string; 
    email?: string; 
    password?: string; 
    userType?: string;
    terms?: string;
    general?: string 
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { 
      fullName?: string; 
      email?: string; 
      password?: string; 
      userType?: string;
      terms?: string;
    } = {}

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain both uppercase and lowercase letters"
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number"
    }

    // User Type validation
    if (!userType) {
      newErrors.userType = "Please select an account type"
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and privacy policy"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/${userType}/dashboard`,
          data: {
            full_name: fullName.trim(),
            user_type: userType,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setErrors({ 
        general: error instanceof Error ? error.message : "An error occurred during sign up" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="mt-16 flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-blue-50/20 to-background">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-2xl border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-blue-50/30 p-6 border-b border-border/50">
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent text-center">
                      Join Choriad
                    </CardTitle>
                    <CardDescription className="text-center">
                      Create your account in less than 2 minutes
                    </CardDescription>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSignUp} noValidate>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="full-name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          if (errors.fullName) {
                            setErrors(prev => ({ ...prev, fullName: undefined }))
                          }
                        }}
                        className={`h-12 px-4 border-2 transition-colors duration-300 ${
                          errors.fullName ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary/50'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                      )}
                    </div>

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
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
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
                          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password ? (
                        <p className="text-sm text-destructive mt-1">{errors.password}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be at least 6 characters with uppercase, lowercase, and numbers
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3">
                      <Label className="text-sm font-medium">
                        I want to
                      </Label>
                      <RadioGroup 
                        value={userType} 
                        onValueChange={(value) => {
                          setUserType(value as "client" | "worker")
                          if (errors.userType) {
                            setErrors(prev => ({ ...prev, userType: undefined }))
                          }
                        }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="client" id="client" className="peer sr-only" />
                          <Label
                            htmlFor="client"
                            className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                              userType === 'client' 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            <User className="mb-3 h-6 w-6" />
                            <span className="text-sm font-medium">Hire Help</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Find service providers
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="worker" id="worker" className="peer sr-only" />
                          <Label
                            htmlFor="worker"
                            className={`flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                              userType === 'worker' 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            <Briefcase className="mb-3 h-6 w-6" />
                            <span className="text-sm font-medium">Offer Services</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Earn money helping others
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.userType && (
                        <p className="text-sm text-destructive mt-1">{errors.userType}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => {
                            setAgreeToTerms(checked as boolean)
                            if (errors.terms) {
                              setErrors(prev => ({ ...prev, terms: undefined }))
                            }
                          }}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the{" "}
                          <Link href="/terms-of-service" className="text-primary hover:underline underline-offset-4">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy-policy" className="text-primary hover:underline underline-offset-4">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      {errors.terms && (
                        <p className="text-sm text-destructive mt-1">{errors.terms}</p>
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
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link 
                        href="/auth/login" 
                        className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors duration-200"
                      >
                        Sign in
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