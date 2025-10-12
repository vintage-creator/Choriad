"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  DollarSign, 
  Star, 
  MessageCircle,
  Smartphone,
  TrendingUp
} from "lucide-react"

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Our intelligent AI agent analyzes your needs and automatically finds the perfect service providers based on skills, ratings, and availability.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Verified Providers",
      description: "Every service provider undergoes rigorous background checks, identity verification, and skill assessments to ensure quality and safety.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book trusted service providers in minutes. Our AI handles scheduling, negotiations, and confirmations automatically.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Dual Platform",
      description: "Seamless experience for both clients needing services and providers looking to earn. Everyone wins with Choraid.",
      color: "from-blue-500 to-cyan-500"
    }
  ]

  const clientFeatures = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Delegate your chores and focus on what matters most. Get back hours in your week."
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "Know the cost upfront with no hidden fees. Competitive rates for quality services."
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "Rate your experience and help maintain our high service standards across all providers."
    },
    {
      icon: MessageCircle,
      title: "Real-time Updates",
      description: "Track your service progress and communicate directly with your assigned provider."
    }
  ]

  const providerFeatures = [
    {
      icon: TrendingUp,
      title: "Earn More",
      description: "Access a steady stream of clients and maximize your earning potential with flexible scheduling."
    },
    {
      icon: Smartphone,
      title: "Easy Management",
      description: "Manage your bookings, payments, and client communications all in one place."
    },
    {
      icon: Users,
      title: "Build Reputation",
      description: "Grow your business through our rating system and build trust with new clients."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid reliably with our secure payment system that protects both providers and clients."
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
        <section className="py-20 bg-gradient-to-br from-primary/5 via-blue-50 to-background">
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
                <span>Powerful Features</span>
              </motion.div>
              
              <motion.h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Everything You Need to Get Things Done
              </motion.h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover how Choraid's innovative platform and AI technology make everyday tasks effortless for everyone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Core Platform Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with cutting-edge technology to serve both clients and service providers
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {mainFeatures.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-3 text-foreground">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Client Features */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">For Clients</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reclaim your time and get things done with trusted help
              </p>
            </motion.div>

            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {clientFeatures.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Provider Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">For Service Providers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Grow your business and earn more with our platform
              </p>
            </motion.div>

            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {providerFeatures.map((feature, index) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg text-center h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}