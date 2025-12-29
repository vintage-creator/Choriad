"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Check,
  Star,
  Zap,
  Crown,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "For Clients",
      description: "Pay only for the services you need",
      price: "15%",
      period: "platform fee per booking",
      features: [
        "AI-powered provider matching",
        "Verified & background-checked providers",
        "Secure payment processing",
        "Real-time task tracking",
        "Rating & review system",
        "24/7 customer support",
        "No subscription fees",
        "Cancel anytime"
      ],
      cta: "Find Help Now",
      popular: false,
      icon: Zap
    },
    {
      name: "For Workers",
      description: "Keep most of what you earn",
      price: "85%",
      period: "of your service fee",
      features: [
        "Access to thousands of clients",
        "Flexible scheduling",
        "Secure payment processing",
        "Profile verification badge",
        "Rating & review system",
        "Client messaging",
        "Earnings dashboard",
        "No subscription fees"
      ],
      cta: "Start Earning",
      popular: true,
      icon: Crown
    }
  ]

  const pricingFaqs = [
    {
      question: "When do clients pay?",
      answer: "Clients pay when they confirm a booking. Funds are held securely until the task is completed and approved."
    },
    {
      question: "When do providers get paid?",
      answer: "Providers receive payment within 24-48 hours after the client confirms task completion."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees. The platform fee is clearly displayed before any booking is confirmed."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel bookings according to our cancellation policy. Cancellation terms vary by service type."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      }
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-blue-50/30 to-background">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 mt-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Simple, Transparent Pricing</span>
              </motion.div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Fair Pricing for Everyone
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Whether you're looking for help or offering services, our pricing is designed to be fair and transparent for all.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="-mt-8">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {plans.map((plan, index) => (
                <motion.div key={plan.name} variants={itemVariants} className="relative">
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`border-2 h-full transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30'
                  }`}>
                    <CardHeader className="text-center pb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <plan.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-lg">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Price */}
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                        </div>
                        <p className="text-muted-foreground mt-2">{plan.period}</p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button 
                        className={`w-full h-12 text-base ${
                          plan.popular
                            ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                            : 'bg-secondary hover:bg-secondary/80'
                        } transition-all duration-300 hover:scale-105`}
                        asChild
                      >
                        <Link href="/auth/sign-up">
                          {plan.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">How Our Pricing Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple, transparent, and designed for fairness
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                {
                  step: "1",
                  title: "Set Your Budget",
                  description: "Clients set their budget. Providers set their rates. Our AI finds the perfect match."
                },
                {
                  step: "2",
                  title: "Secure Payment",
                  description: "Clients pay upfront. Funds are held securely until the task is completed satisfactorily."
                },
                {
                  step: "3",
                  title: "Fair Distribution",
                  description: "Providers receive 85% of the service fee. 15% covers platform operations and safety."
                }
              ].map((item, index) => (
                <motion.div key={item.step} variants={itemVariants} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Common questions about our pricing and payment system
              </p>
            </motion.div>

            <motion.div 
              className="grid gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {pricingFaqs.map((faq, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional Help */}
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-muted-foreground mb-6">
                Still have questions about pricing?
              </p>
              <Button asChild variant="outline" className="border-2 bg-transparent hover:bg-accent/50">
                <Link href="/contact">Contact Our Support Team</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}