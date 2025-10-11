import { ShoppingCart, Home, Car, Package, Utensils, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: ShoppingCart,
    title: "Grocery Shopping",
    description: "Get your groceries delivered from your favorite stores",
  },
  {
    icon: Home,
    title: "Home Cleaning",
    description: "Professional cleaning services for your home or office",
  },
  {
    icon: Car,
    title: "Errands & Delivery",
    description: "Pick up and deliver items across the city",
  },
  {
    icon: Package,
    title: "Package Collection",
    description: "Collect packages and parcels on your behalf",
  },
  {
    icon: Utensils,
    title: "Meal Prep",
    description: "Home-cooked meals prepared to your taste",
  },
  {
    icon: Wrench,
    title: "Handyman Services",
    description: "Quick fixes and repairs around your home",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Services We Offer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From daily chores to special tasks, our verified providers are ready to help
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
