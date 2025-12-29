// components/worker/dashboard-header.tsx 
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  HomeIcon,
  Settings,
  Calendar,
  Home,
  Briefcase,
  Bell,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  User,
  PiggyBank,
  FileText,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile, Worker } from "@/lib/types"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "../Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { NotificationDropdown } from "./notification-dropdown"

interface WorkerDashboardHeaderProps {
  profile: Profile | null
  worker: Worker | null
}

export function WorkerDashboardHeader({
  profile,
  worker,
}: WorkerDashboardHeaderProps) {
  const router = useRouter()

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentPath, setCurrentPath] = useState<string | null>(null)

  // Avatar state
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setCurrentPath(window.location.pathname)
    } catch {
      setCurrentPath(null)
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function resolveAvatar() {
      setImageError(false)
      setResolvedAvatarUrl(null)

      const supabase = createClient()

      // Try worker's stored pictures first
      try {
        if (worker?.id) {
          const { data, error } = await supabase
            .from("workers")
            .select("profile_pictures_urls")
            .eq("id", worker.id)
            .single()

          if (!cancelled && !error && data) {
            const pics = (data as any).profile_pictures_urls as string[] | null | undefined

            if (Array.isArray(pics) && pics.length > 0 && pics[0]) {
              const candidate = String(pics[0])
              if (candidate.startsWith("http")) {
                setResolvedAvatarUrl(candidate)
                return
              } else {
                try {
                  const path = candidate.replace(/^\/+/, "")
                  const resp = supabase.storage.from("worker-profiles").getPublicUrl(path)
                  const publicUrl =
                    (resp as any)?.data?.publicUrl ||
                    (resp as any)?.data?.publicURL ||
                    (resp as any)?.publicUrl ||
                    (resp as any)?.publicURL ||
                    null
                  if (publicUrl) {
                    setResolvedAvatarUrl(publicUrl)
                    return
                  }
                } catch {
                  // continue to profile fallback
                }
              }
            }
          }
        }
      } catch {
        // ignore and continue to profile fallback
      }

      try {
        const candidate = profile?.avatar_url ?? null
        if (!candidate) return

        if (typeof candidate === "string" && candidate.startsWith("http")) {
          if (!cancelled) setResolvedAvatarUrl(candidate)
          return
        } else if (typeof candidate === "string") {
          try {
            const path = candidate.replace(/^\/+/, "")
            const resp = supabase.storage.from("worker-profiles").getPublicUrl(path)
            const publicUrl =
              (resp as any)?.data?.publicUrl ||
              (resp as any)?.data?.publicURL ||
              (resp as any)?.publicUrl ||
              (resp as any)?.publicURL ||
              null
            if (!cancelled && publicUrl) setResolvedAvatarUrl(publicUrl)
          } catch {
            if (!cancelled) setResolvedAvatarUrl(null)
          }
        }
      } catch {
        if (!cancelled) setResolvedAvatarUrl(null)
      }
    }

    if (typeof window !== "undefined") {
      resolveAvatar()
    }

    return () => {
      cancelled = true
    }
  }, [worker?.id, profile?.avatar_url])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const statusColors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800 border-emerald-200",
    busy: "bg-amber-100 text-amber-800 border-amber-200",
    offline: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const navItems = [
    { name: "Dashboard", href: "/worker/dashboard", icon: Home },
    { name: "Bookings", href: "/worker/bookings", icon: Calendar },
    { name: "Jobs", href: "/worker/jobs", icon: Briefcase },
    { name: "Earnings", href: "/worker/earnings", icon: PiggyBank},
  ]

  const initials =
    (profile?.full_name
      ? profile.full_name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
      : "W"
    ).toUpperCase()

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b shadow-sm"
            : "bg-white border-b"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 md:h-20 justify-between">
            {/* Left: Logo & Brand */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center gap-3">
                  <div className="w-28 sm:w-36">
                    <Logo className="w-72 h-auto text-foreground" />
                  </div>
                </div>
              </Link>

              {/* Status Badge */}
              {worker && (
                <div className="hidden md:flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      statusColors[worker.availability_status]
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          worker.availability_status === "available"
                            ? "bg-emerald-500"
                            : worker.availability_status === "busy"
                            ? "bg-amber-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {worker.availability_status.charAt(0).toUpperCase() +
                        worker.availability_status.slice(1)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = mounted && currentPath === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className={`gap-2 ${
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                )
              })}
            </nav>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-3">
              {worker && (
                <NotificationDropdown 
                  workerId={worker.id} 
                  city={worker.location_city} 
                />
              )}

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-gray-50 cursor-pointer">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      {mounted && resolvedAvatarUrl && !imageError ? (
                        <AvatarImage
                          src={resolvedAvatarUrl}
                          alt={profile?.full_name || "User"}
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-600 text-white">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {profile?.full_name || "Worker"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(worker as any)?.skills?.[0] || "Service Provider"}
                      </div>
                    </div>
                    <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/worker/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/worker/profile/bank-details" className="cursor-pointer">
                      <HomeIcon className="mr-2 h-4 w-4" />
                      Bank Details
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/worker/earnings" className="cursor-pointer">
                      <PiggyBank className="mr-2 h-4 w-4" />
                      Earnings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/worker/applications" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      My Applications
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/worker/bookings" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Bookings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/worker/notifications" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/faq" className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help Center
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-50">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  {mounted && resolvedAvatarUrl && !imageError ? (
                    <AvatarImage
                      src={resolvedAvatarUrl}
                      alt={profile?.full_name || "User"}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-600 text-white">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">
                    {profile?.full_name || "Worker"}
                  </div>
                  <div className="text-sm text-gray-500">{profile?.email}</div>
                </div>
              </div>

              <Separator />

              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = mounted && currentPath === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}

              <Separator />

              <Link
                href="/worker/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>

              <Link
                href="/worker/profile/bank-details"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <PiggyBank className="h-4 w-4" />
                Bank Details
              </Link>

              <Link
                href="/worker/applications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                My Applications
              </Link>

              <Separator />

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}