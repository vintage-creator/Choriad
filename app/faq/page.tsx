"use client";

import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { Sparkles, MessageCircle, Search, UserCheck } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      question: "How does the AI Agent work?",
      answer: "Our AI Agent uses advanced natural language processing to understand your needs. Simply describe what task you need help with, and the AI will autonomously search for qualified service providers, check their availability, negotiate terms, and create bookings on your behalf—all without requiring manual approval for each step.",
      icon: Sparkles
    },
    {
      question: "How are service providers verified?",
      answer: "All service providers go through a rigorous verification process including identity verification, background checks, skill assessments, and reference checks. We also continuously monitor performance through our rating and review system to ensure quality standards are maintained.",
      icon: UserCheck
    },
    {
      question: "What cities do you operate in?",
      answer: "We currently operate in Lagos, Abuja, and Port Harcourt. We're constantly expanding to new cities across Nigeria. Sign up to be notified when we launch in your area.",
      icon: Search
    },
    {
      question: "How does pricing work?",
      answer: "Service providers set their own rates based on their skills and experience. Our platform charges a 15% commission on completed bookings. You'll see the total cost upfront before confirming any booking, with no hidden fees.",
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We have a comprehensive dispute resolution system. If you're not satisfied, you can report issues through your booking page. Our team will review the case and work to resolve it fairly. We also have a rating system to help maintain service quality.",
    },
    {
      question: "How do payments work?",
      answer: "Payments are processed securely through Stripe. You pay when you create a booking, and funds are held until the task is completed. Once you confirm completion, the payment is released to the service provider minus our 15% platform fee.",
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel bookings through your dashboard. Cancellation policies vary by service provider and timing. Cancellations made well in advance typically receive full refunds, while last-minute cancellations may incur fees.",
    },
    {
      question: "How do I become a service provider?",
      answer: "Sign up as a service provider, complete your profile with your skills and experience, and submit verification documents. Once approved, you can start accepting jobs. You'll receive notifications when jobs matching your skills become available.",
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent. Service providers only see information necessary to complete your tasks.",
    },
    {
      question: "What types of tasks can I request?",
      answer: "We support a wide range of tasks including grocery shopping, laundry services, home cleaning, errands, personal shopping, pet care, and more. If you're unsure, just ask our AI Agent—it can help determine if we can assist with your specific need.",
    },
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
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30  pb-12">
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
                className="inline-flex items-center mt-8 gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>We're here to help</span>
              </motion.div>
              
              <motion.h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Frequently Asked Questions
              </motion.h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Find answers to common questions about Choriad and how our platform works. 
                Can't find what you're looking for? Contact our support team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
        <div className="mx-auto max-w-7xl px-4 -mt-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <AccordionItem 
                      value={`item-${index}`}
                      className="border border-border/50 rounded-2xl px-6 hover:border-primary/30 transition-colors duration-300 data-[state=open]:border-primary/50 data-[state=open]:bg-primary/5"
                    >
                      <AccordionTrigger className="py-6 hover:no-underline group">
                        <div className="flex items-start gap-4 text-left">
                          {faq.icon && (
                            <div className="p-2 rounded-lg bg-primary/10 mt-1 group-data-[state=open]:bg-primary/20 transition-colors">
                              <faq.icon className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                            {faq.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                        <div className="pl-12">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>

            {/* Contact CTA */}
            <motion.div 
              className="mt-16 p-8 bg-gradient-to-br from-primary/5 to-blue-50/30 rounded-3xl border border-primary/20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our support team is here to help you get the most out of Choriad. 
                We typically respond within minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 bg-transparent hover:bg-accent/50 transition-all duration-300">
                  <a href="mailto:support@choriad.com">Email Us</a>
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