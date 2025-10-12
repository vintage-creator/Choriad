"use client";

import { ShoppingCart, Home, Car, Package, Utensils, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: ShoppingCart,
    title: "Grocery Shopping",
    description: "Get your groceries delivered from your favorite stores",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Home,
    title: "Home Cleaning",
    description: "Professional cleaning services for your home or office",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: Car,
    title: "Errands & Delivery",
    description: "Pick up and deliver items across the city",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Package,
    title: "Package Collection",
    description: "Collect packages and parcels on your behalf",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: Utensils,
    title: "Meal Prep",
    description: "Home-cooked meals prepared to your taste",
    color: "from-rose-500 to-red-600"
  },
  {
    icon: Wrench,
    title: "Handyman Services",
    description: "Quick fixes and repairs around your home",
    color: "from-amber-500 to-orange-600"
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any
      }
    }
  }

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Services We Offer
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From daily chores to special tasks, our verified providers are ready to help with quality service you can trust
          </p>
        </motion.div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:scale-105 group overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
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
  )
}