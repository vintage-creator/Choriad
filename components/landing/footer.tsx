import Link from "next/link";
import { Logo } from "../Logo";

export function Footer() {
  const linkMap: Record<string, string> = {
    "About Us": "/about-us",
    "Terms of Service": "/terms-of-service",
    "Privacy Policy": "/privacy-policy",
  };

  return (
    <footer className="border-t bg-gradient-to-b from-muted/50 to-muted/30">
      <div className="mx-auto max-w-7xl py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-28 sm:w-36">
                <Logo className="w-72 h-auto text-foreground" />
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Your trusted platform for everyday tasks in Nigerian cities.
              Quality service, verified providers.
            </p>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              For Clients
            </h3>
            <ul className="space-y-3">
              {["Post a Task", "Browse Services", "How It Works"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={
                        item === "Post a Task"
                          ? "/auth/sign-up"
                          : item === "Browse Services"
                          ? "/Earn"
                          : "/earn"
                      }
                      className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              For Providers
            </h3>
            <ul className="space-y-3">
              {[
                "Become a Provider",
                "Verification Process",
                "Earnings Calculator",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={
                      item === "Become a Provider"
                        ? "/auth/sign-up"
                        : item === "Earnings Calculator"
                        ? "/earnings-calculator"
                        : "#trust"
                    }
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Company
            </h3>
            <ul className="space-y-3">
              {["About Us", "Privacy Policy", "Terms of Service"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={linkMap[item] ?? "#"}
                      className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Choriad. All rights reserved.
            <br />
            <span className="text-sm text-black-200">
              Building better communities through trusted services.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
