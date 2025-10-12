"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; // App Router
// If you're using Pages Router, replace above with:
// import { useRouter } from "next/router";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // current path (App Router)
  const pathname = usePathname();

  // If you are on Pages Router, use:
  // const { pathname } = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking on a link
  const handleNavClick = () => setIsMobileMenuOpen(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  // Helper to normalize and compare paths (handles trailing slash)
  const normalize = (p?: string) => (p ? p.replace(/\/+$/, "") || "/" : "/");
  const current = normalize(pathname);

  const isActiveLink = (href: string) => {
    const target = normalize(href);
    // exact match or target is prefix of current (optional)
    return current === target || current.startsWith(target + "/");
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 group"
          onClick={handleNavClick}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-lg">C</span>
            </div>
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
          </div>
          <div className="font-bold text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Choriad
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {/* animated underline: expands on hover or when active */}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="hover:scale-105 transition-transform duration-200"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200 relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div className="fixed top-0 left-0 right-0 h-full bg-background md:hidden z-50 shadow-lg overflow-auto">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
                <Link
                  href="/"
                  className="flex items-center space-x-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow">
                      <span className="font-bold text-white text-sm">C</span>
                    </div>
                  </div>
                  <div className="font-bold text-lg bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Choriad
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Panel content */}
              <div className="px-4 py-6 space-y-6">
                <nav className="space-y-4">
                  {navItems.map((item, index) => {
                    const active = isActiveLink(item.href);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          aria-current={active ? "page" : undefined}
                          className={`block py-3 text-lg font-medium transition-colors duration-200 border-b border-border/50 ${
                            active
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="pt-4 space-y-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    className="w-full justify-center h-12 text-base"
                    asChild
                  >
                    <Link href="/auth/login" onClick={handleNavClick}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    className="w-full justify-center h-12 text-base bg-gradient-to-r from-primary to-primary/90"
                    asChild
                  >
                    <Link href="/auth/sign-up" onClick={handleNavClick}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
