"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, LogOut, Calendar, Sparkles, Menu, X, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../Logo";

interface DashboardHeaderProps {
  profile: Profile | null;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "Home", href: "/client/dashboard", icon: Home },
    { name: "AI Agent", href: "/client/ai-agent", icon: Sparkles },
    { name: "Bookings", href: "/client/bookings", icon: Calendar },
  ];

  const normalize = (p?: string) => (p ? p.replace(/\/+$/, "") || "/" : "/");
  const current = normalize(pathname || "/");

  const isActiveLink = (href: string) => {
    const target = normalize(href);
    return current === target || current.startsWith(target + "/");
  };

  const handleNavClick = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 group"
          onClick={handleNavClick}
        >
          <div className="relative">
            <div className="w-28 sm:w-36">
              <Logo className="w-72 h-auto text-foreground" />
            </div>
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={handleNavClick}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 relative px-2 py-1 ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>

                {/* underline */}
                <span
                  className={`absolute -bottom-1 left-2 h-0.5 bg-primary transition-all duration-300 ${
                    active
                      ? "w-[calc(100%-0.5rem)]"
                      : "w-0 group-hover:w-[calc(100%-0.5rem)]"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/client/jobs/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post a Task</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {/* Sign out button on desktop (icon only) */}
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="hidden md:inline-flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>

            <Avatar className="border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                {profile?.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white/95 backdrop-blur-sm"
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`w-full justify-start ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                    asChild
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3"
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}

              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
