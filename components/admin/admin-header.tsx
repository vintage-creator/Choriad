// components/admin/admin-header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Menu as MenuIcon, X as XIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

interface AdminHeaderProps {
  profile: any;
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Verifications", href: "/admin/verifications" },
    { name: "Payouts", href: "/admin/payouts" },
    { name: "Users", href: "/admin/users" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));

  return (
    <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex h-16 items-center gap-3 text-primary">
                <Logo className="h-6 w-auto" />
              </div>
              <span className="sr-only">Go to Choriad Admin dashboard</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2" aria-label="Primary admin">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={`rounded-md px-3 py-2 ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>

          {/* Right: mobile toggle + avatar */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => setMobileOpen((s) => !s)}
            >
              {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                  <Avatar className="h-10 w-10">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile?.full_name ?? "Admin"} />
                    ) : (
                      <AvatarFallback>{profile?.full_name?.[0] ?? "A"}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>

                <DropdownMenuSeparator />

                {/* <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem> */}

                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu panel (slide down) */}
      <div
        className={`md:hidden transition-[max-height,opacity] duration-250 ease-in-out overflow-hidden bg-white border-t ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="px-4 pb-4 pt-3 space-y-1" aria-label="Mobile admin">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}

          <div className="pt-2 border-t mt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
