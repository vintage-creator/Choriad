import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Powered by Agentic AI
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance mb-6">
              Your AI Assistant Finds & Books <span className="text-primary">Service Providers</span> for You
            </h1>
            <p className="text-lg text-muted-foreground text-pretty mb-8 leading-relaxed">
              Just tell our AI what you need. It autonomously finds verified providers in Lagos, Abuja, and Port
              Harcourt, negotiates on your behalf, and books them instantly. From grocery shopping to home cleaning—all
              handled automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base">
                <Link href="/auth/sign-up">
                  Try AI Assistant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/auth/sign-up">Become a Provider</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Verified Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
          <div className="relative lg:block hidden">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <img
                src="/ai-assistant-chatbot-interface-with-service-provid.jpg"
                alt="AI Assistant matching service providers"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
