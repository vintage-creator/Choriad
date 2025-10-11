"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile, Worker } from "@/lib/types"

interface WorkerDashboardHeaderProps {
  profile: Profile | null
  worker: Worker | null
}

export function WorkerDashboardHeader({ profile, worker }: WorkerDashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const statusColors = {
    available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    busy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    offline: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  }

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/worker/dashboard" className="flex items-center space-x-2">
          <div className="font-bold text-xl text-primary">Choraid</div>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/worker/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              Bookings
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-4">
          {worker && <Badge className={statusColors[worker.availability_status]}>{worker.availability_status}</Badge>}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{profile?.full_name?.[0] || "W"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/worker/profile">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
