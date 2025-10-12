"use client";

import type React from "react";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      description: "Call us directly",
      value: "+234 706 573 7817",
      link: "tel:+2347065737817",
    },
    {
      icon: MapPin,
      title: "Operating Cities",
      description: "Currently serving",
      value: "Lagos, Abuja & Port Harcourt",
    },
    {
      icon: Clock,
      title: "Support Hours",
      description: "We're here to help",
      value: "7:00 AM - 10:00 PM Daily",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      },
    },
  };

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
                <Phone className="h-4 w-4" />
                <span>We're here to help</span>
              </motion.div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Get in Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have questions or feedback? We'd love to hear from you. Our team
                typically responds within hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="-mt-12 pb-12">
          <div className="mx-auto max-w-7xl px-4">
            <motion.div
              className="grid lg:grid-cols-2 gap-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Contact Form */}
              <motion.div variants={itemVariants}>
                <Card className="shadow-2xl border-border/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/5 to-blue-50/30 p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                        <Send className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          Send us a message
                        </CardTitle>
                        <CardDescription>
                          Fill out the form and we'll get back to you within
                          hours
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    {submitted ? (
                      <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          We'll get back to you within a few hours.
                        </p>
                        <Button
                          onClick={() => setSubmitted(false)}
                          variant="outline"
                        >
                          Send Another Message
                        </Button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Your full name"
                            required
                            className="h-12 border-2 focus:border-primary/50 transition-colors duration-300"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="h-12 border-2 focus:border-primary/50 transition-colors duration-300"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label
                            htmlFor="subject"
                            className="text-sm font-medium"
                          >
                            Subject
                          </Label>
                          <Input
                            id="subject"
                            placeholder="How can we help you?"
                            required
                            className="h-12 border-2 focus:border-primary/50 transition-colors duration-300"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label
                            htmlFor="message"
                            className="text-sm font-medium"
                          >
                            Message
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            rows={5}
                            required
                            className="border-2 focus:border-primary/50 transition-colors duration-300 resize-none"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sending Message...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send Message
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Single container for all contact info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 space-y-6">
                      {contactInfo.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-4"
                        >
                          <div className="p-3 rounded-xl bg-primary/10">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            {item.link ? (
                              <a
                                href={item.link}
                                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-foreground font-medium">
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-gradient-to-br from-primary/5 to-blue-50/30 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3">
                        Why Choose Choriad?
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          AI-powered service provider matching
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Verified and background-checked providers
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Secure payment processing
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          24/7 customer support
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
