import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center bg-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-balance">
            Ready to Reclaim Your Time?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join thousands of busy professionals who trust Choraid to handle their daily tasks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base">
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <Link href="/auth/sign-up">Earn as a Provider</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
