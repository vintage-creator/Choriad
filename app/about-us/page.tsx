"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Target, 
  Users, 
  Heart,
  ArrowRight,
  Shield,
  Star,
  Zap,
  Globe
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Every provider is thoroughly verified with background checks and ongoing performance monitoring."
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Our intelligent matching system connects you with the perfect provider for your specific needs."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We're building a trusted community where everyone can thrive and grow together."
    },
    {
      icon: Star,
      title: "Excellence",
      description: "We maintain high standards through ratings, reviews, and continuous quality improvement."
    }
  ]

  const stats = [
    { number: "200+", label: "Verified Service Providers" },
    { number: "1500+", label: "Tasks Completed" },
    { number: "4.8/5", label: "Average Customer Rating" },
    { number: "3", label: "Cities Across Nigeria" }
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
      <main className="min-h-screen bg-white">
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mt-12 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Sparkles className="h-4 w-4" />
                <span>About Choriad</span>
              </motion.div>
              
              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Connecting Talent with Opportunity
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                We're building Nigeria's most trusted platform for everyday services, 
                powered by AI to make task completion seamless and reliable.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p className="text-lg">
                    To create economic opportunities so people have better access to trusted help 
                    for their daily tasks while enabling skilled individuals to build sustainable livelihoods.
                  </p>
                  <p>
                    In today's fast-paced world, people are busier than ever with demanding schedules. 
                    That's where our Agentic AI comes in - it handles the entire process of finding, 
                    vetting, and booking service providers automatically, saving you time and ensuring quality service.
                  </p>
                </div>
              </div>

              <div
                className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story - Upwork Style */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How a simple observation led to revolutionizing everyday services in Nigeria
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Smaller Founder Image */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src="https://res.cloudinary.com/dcoxo8snb/image/upload/v1759657226/1682384202863_1_of1tc0.jpg"
                        alt="Israel Abazie - Founder of Choriad"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <blockquote className="text-gray-600 leading-relaxed mb-6">
                      <p className="text-lg italic mb-4">
                        "Choriad was born from a simple yet powerful observation. My friend, an excellent cook, 
                        was invited and paid ₦120,000 to cook for a family in Lekki. This opened my eyes to a 
                        huge opportunity - so many people need trusted help for various chores but don't know who to trust."
                      </p>
                      <p className="mb-4">
                        At the same time, many skilled individuals are looking for side hustles and ways to earn 
                        extra income. The challenge was connecting these two groups in a safe, reliable way.
                      </p>
                      <p>
                        Today, we're solving this at scale with technology that makes finding and booking trusted 
                        help as easy as sending a message.
                      </p>
                    </blockquote>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">Israel Abazie</h3>
                      <p className="text-gray-600">Founder & CEO, Choriad</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do at Choriad
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {values.map((value, index) => (
                <motion.div key={value.title} variants={itemVariants}>
                  <Card className="border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

       

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Join the Choriad Community Today</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Whether you need help with tasks or want to earn by helping others, Choriad is here for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/auth/sign-up">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="border-white bg-blue-600 text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}