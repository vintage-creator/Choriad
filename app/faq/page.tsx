import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      question: "How does the AI Agent work?",
      answer:
        "Our AI Agent uses advanced natural language processing to understand your needs. Simply describe what task you need help with, and the AI will autonomously search for qualified service providers, check their availability, negotiate terms, and create bookings on your behalf—all without requiring manual approval for each step.",
    },
    {
      question: "How are service providers verified?",
      answer:
        "All service providers go through a rigorous verification process including identity verification, background checks, skill assessments, and reference checks. We also continuously monitor performance through our rating and review system to ensure quality standards are maintained.",
    },
    {
      question: "What cities do you operate in?",
      answer:
        "We currently operate in Lagos, Abuja, and Port Harcourt. We're constantly expanding to new cities across Nigeria. Sign up to be notified when we launch in your area.",
    },
    {
      question: "How does pricing work?",
      answer:
        "Service providers set their own rates based on their skills and experience. Our platform charges a 15% commission on completed bookings. You'll see the total cost upfront before confirming any booking, with no hidden fees.",
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer:
        "We have a comprehensive dispute resolution system. If you're not satisfied, you can report issues through your booking page. Our team will review the case and work to resolve it fairly. We also have a rating system to help maintain service quality.",
    },
    {
      question: "How do payments work?",
      answer:
        "Payments are processed securely through Stripe. You pay when you create a booking, and funds are held until the task is completed. Once you confirm completion, the payment is released to the service provider minus our 15% platform fee.",
    },
    {
      question: "Can I cancel a booking?",
      answer:
        "Yes, you can cancel bookings through your dashboard. Cancellation policies vary by service provider and timing. Cancellations made well in advance typically receive full refunds, while last-minute cancellations may incur fees.",
    },
    {
      question: "How do I become a service provider?",
      answer:
        "Sign up as a service provider, complete your profile with your skills and experience, and submit verification documents. Once approved, you can start accepting jobs. You'll receive notifications when jobs matching your skills become available.",
    },
    {
      question: "Is my personal information safe?",
      answer:
        "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent. Service providers only see information necessary to complete your tasks.",
    },
    {
      question: "What types of tasks can I request?",
      answer:
        "We support a wide range of tasks including grocery shopping, laundry services, home cleaning, errands, personal shopping, pet care, and more. If you're unsure, just ask our AI Agent—it can help determine if we can assist with your specific need.",
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Choraid and how our platform works
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-muted rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">We're here to help. Get in touch with our support team.</p>
            <Button asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
