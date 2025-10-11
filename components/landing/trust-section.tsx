import { Shield, Star, Clock, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Providers",
    description: "All service providers undergo thorough background checks and verification",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Read honest reviews from other clients before booking",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    description: "Track your provider in real-time and get updates on task progress",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Pay safely through our platform with buyer protection",
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Trust & Safety First</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your safety and satisfaction are our top priorities
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature) => (
            <Card key={feature.title} className="border-border/50">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
