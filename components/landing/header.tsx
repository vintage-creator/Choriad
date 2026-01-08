// header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "../Logo";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserClient();

    async function fetchProfile() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.error("Failed to fetch profile", error);
          setProfile(null);
        } else {
          setProfile(profileData ?? null);
        }
      } catch (err) {
        console.error("Auth/profile fetch error", err);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          if (mounted) setProfile(null);
        } else {
          fetchProfile();
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = () => setIsMobileMenuOpen(false);

  const publicNav = [
    { name: "Home", href: "/" },
    { name: "Earn", href: "/earn" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  // compute dashboard URL from role (default -> client)
  const dashboardHref =
    profile?.user_type === "worker" ? "/worker/dashboard" : "/client/dashboard";

  // nav items include a Dashboard if profile exists
  const navItems = profile
    ? [{ name: "", href: dashboardHref }, ...publicNav]
    : publicNav;

  const normalize = (p?: string) => (p ? p.replace(/\/+$/, "") || "/" : "/");
  const current = normalize(pathname);
  const isActiveLink = (href: string) => {
    const target = normalize(href);
    return current === target || current.startsWith(target + "/");
  };

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setProfile(null);
      router.push("/");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  // Check if we're on a page that needs white navigation (dark hero section)
  const isDarkHeroPage = () => {
    // List of pages that have dark hero backgrounds
    const darkHeroPages = ["/earn"];
    return darkHeroPages.includes(pathname ?? "");
  };

  // Determine header text color based on scroll state and page
  const getHeaderTextColor = () => {
    if (isScrolled) {
      return "text-foreground";
    }
    return isDarkHeroPage() ? "text-white" : "text-foreground";
  };

  // Determine logo color based on scroll state and page
  const getLogoColor = () => {
    if (isScrolled) {
      return "text-foreground";
    }
    return isDarkHeroPage() ? "text-white" : "text-foreground";
  };

  // Determine link colors based on active state, scroll, and page
  const getLinkTextClass = (isActive: boolean) => {
    if (isScrolled) {
      // When scrolled, header has white background
      return isActive
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground";
    }

    if (isDarkHeroPage()) {
      // On dark hero pages, use white text
      return isActive ? "text-white" : "text-white/80 hover:text-white";
    }

    // Default (light pages, not scrolled)
    return isActive
      ? "text-primary"
      : "text-muted-foreground hover:text-foreground";
  };

  // Determine underline color
  const getUnderlineColor = (isActive: boolean) => {
    if (isScrolled) {
      return "bg-primary"; // Default primary color
    }

    if (isDarkHeroPage()) {
      return isActive ? "bg-white" : "bg-white"; // White underline for dark pages
    }

    return "bg-primary"; // Default primary color
  };

  // Determine button variant for Get Started button
  const getStartButtonVariant = () => {
    if (isScrolled) {
      return "default"; // Default gradient button
    }

    if (isDarkHeroPage()) {
      return "outline-white"; // White outline on dark backgrounds
    }

    return "default"; // Default gradient button
  };

  return (
    <header
      role="banner"
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent border-transparent"
      } ${getHeaderTextColor()}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center h-16 justify-between md:grid md:grid-cols-3 md:items-center md:h-24">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center"
            >
              <span className="sr-only">Choriad home</span>
              <div className="w-28 sm:w-36">
                <Logo
                  className={`w-72 h-auto transition-colors duration-300 ${getLogoColor()}`}
                />
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="hidden md:flex justify-center"
          >
            <ul className="flex items-center gap-6">
              {navItems.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={handleNavClick}
                      className={`group inline-block px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 ${getLinkTextClass(
                        active
                      )}`}
                    >
                      <span className="relative inline-block">
                        {item.name}
                        <span
                          className={`absolute left-1/2 h-0.5 transition-all duration-300 transform -translate-x-1/2 ${
                            active
                              ? "w-8 bottom-[-4px]"
                              : "w-0 bottom-[-4px] group-hover:w-8"
                          } ${getUnderlineColor(active)}`}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: Desktop Auth / Avatar */}
          <div className="hidden md:flex items-center justify-end gap-3">
            {loading ? (
              <div className="flex items-center gap-2 px-3">
                <Loader2
                  className={`w-5 h-5 animate-spin ${
                    isScrolled
                      ? "text-muted-foreground"
                      : isDarkHeroPage()
                      ? "text-white/80"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
            ) : profile ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className={`text-sm px-3 py-1 rounded-md hover:bg-accent transition-colors ${
                    isScrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : isDarkHeroPage()
                      ? "text-white/80 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className={`inline-flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                    isScrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : isDarkHeroPage()
                      ? "text-white/80 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                <Link href={dashboardHref} className="flex items-center">
                  <Avatar className="border-2 border-primary/20">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-600 text-white">
                      {profile.full_name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className={`hover:scale-105 transition-transform duration-200 ${
                    isScrolled
                      ? ""
                      : isDarkHeroPage()
                      ? "text-white hover:text-white border-white/20 hover:bg-white/10"
                      : ""
                  }`}
                >
                  <Link href="/auth/login">Login</Link>
                </Button>

                {isDarkHeroPage() && !isScrolled ? (
                  <Button
                    asChild
                    className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              className={`p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative z-50 ${
                isScrolled
                  ? ""
                  : isDarkHeroPage()
                  ? "text-white hover:bg-white/10"
                  : ""
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay + panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 md:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-16 left-0 right-0 bg-background md:hidden z-50 border-b shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="px-4 py-6 space-y-6">
                {/* Navigation */}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleNavClick}
                        className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                          active
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t pt-4 space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : profile ? (
                    <>
                      {/* Profile summary */}
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {profile.full_name?.[0]?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <div className="font-medium">{profile.full_name}</div>
                          <div className="text-muted-foreground">
                            {profile.email}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          router.push(dashboardHref);
                        }}
                      >
                        Dashboard
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-center text-destructive"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/auth/login" onClick={handleNavClick}>
                          Login
                        </Link>
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-primary/90"
                        asChild
                      >
                        <Link href="/auth/sign-up" onClick={handleNavClick}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
