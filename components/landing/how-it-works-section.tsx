import { Search, UserCheck, Calendar, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Post Your Task",
    description: "Describe what you need help with and set your budget",
  },
  {
    icon: UserCheck,
    title: "Get Matched",
    description: "Our AI matches you with verified providers in your area",
  },
  {
    icon: Calendar,
    title: "Schedule & Pay",
    description: "Choose a time that works and pay securely through the platform",
  },
  {
    icon: CheckCircle,
    title: "Task Complete",
    description: "Your task gets done, and you rate your experience",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How Choraid Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting help is simple and secure. Here&apos;s how it works
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
