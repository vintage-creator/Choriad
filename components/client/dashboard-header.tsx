"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, LogOut, Calendar, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface DashboardHeaderProps {
  profile: Profile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/client/dashboard" className="flex items-center space-x-2">
          <div className="font-bold text-xl text-primary">Choraid</div>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/ai-agent">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Agent
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              Bookings
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/client/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post a Task
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{profile?.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
