"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Manager",
    location: "Lagos",
    rating: 5,
    text: "Choriad has been a lifesaver for my busy schedule. The AI matching found me a fantastic home cleaner who now comes weekly. It's like having a personal assistant!",
    type: "client",
    image: "👩‍💼"
  },
  {
    id: 2,
    name: "Michael Adebayo",
    role: "Service Provider",
    location: "Abuja",
    rating: 5,
    text: "As a handyman, Choriad has helped me grow my business beyond word-of-mouth. The platform brings me consistent work and the payments are always secure.",
    type: "provider",
    image: "👨‍🔧"
  },
  {
    id: 3,
    name: "Grace Okafor",
    role: "Working Mom",
    location: "Port Harcourt",
    rating: 5,
    text: "Between work and family, I had no time for groceries. Choriad's AI found me a reliable shopper who knows exactly what I need. Total game-changer!",
    type: "client",
    image: "👩‍👧‍👦"
  },
  {
    id: 4,
    name: "David Chukwu",
    role: "Delivery Specialist",
    location: "Lagos",
    rating: 5,
    text: "I've doubled my income since joining Choriad. The AI matching ensures I get jobs that fit my skills and location. The platform is easy to use and payments are prompt.",
    type: "provider",
    image: "🚴‍♂️"
  },
  {
    id: 5,
    name: "Amara Nwosu",
    role: "Small Business Owner",
    location: "Abuja",
    rating: 5,
    text: "The verification process gave me confidence to try the platform. My package collection provider is now my go-to for all errands. Professional and reliable!",
    type: "client",
    image: "👩‍💻"
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const nextTestimonial = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  useEffect(() => {
    intervalRef.current = setInterval(nextTestimonial, 5000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what our clients and service providers are saying about their Choriad experience
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hidden sm:flex"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hidden sm:flex"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonial Carousel */}
          <div className="relative h-96 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
              >
                <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="flex-1">
                      {/* Quote Icon */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Quote className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-4xl">{testimonials[currentIndex].image}</div>
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <blockquote className="text-lg text-muted-foreground leading-relaxed mb-6 italic">
                        "{testimonials[currentIndex].text}"
                      </blockquote>
                    </div>

                    {/* Author Info */}
                    <div className="border-t border-border/50 pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {testimonials[currentIndex].name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          testimonials[currentIndex].type === 'client' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {testimonials[currentIndex].type === 'client' ? 'Client' : 'Service Provider'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary' 
                    : 'bg-border hover:bg-primary/50'
                }`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}