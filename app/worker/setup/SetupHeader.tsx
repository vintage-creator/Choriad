// /components/setup/SetupHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export function SetupHeader() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="sr-only">Choriad home</span>
              <div className="w-28 sm:w-36">
                <Logo className="w-72 h-auto text-foreground" />
              </div>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoading ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}