import Link from "next/link";

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
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-lg">C</span>
              </div>
              <div className="font-bold text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Choriad
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Your trusted platform for everyday tasks in Nigerian cities.
              Quality service, verified providers.
            </p>
          </div>

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
                          ? "/features"
                          : "#how-it-works"
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
                      item === "Become a Provider" ? "/auth/sign-up" : "#trust"
                    }
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Company
            </h3>
            <ul className="space-y-3">
              {["About Us", "Privacy Policy", "Terms of Service"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      key={item}
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
            Building better communities through trusted services.
          </p>
        </div>
      </div>
    </footer>
  );
}
