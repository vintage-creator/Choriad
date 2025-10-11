"use server"

import { stripe } from "@/lib/stripe"

export async function createPaymentIntent(amountNgn: number, bookingId: string) {
  // Convert NGN to smallest currency unit (kobo)
  const amountInKobo = amountNgn * 100

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInKobo,
    currency: "ngn",
    metadata: {
      booking_id: bookingId,
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
  }
}
