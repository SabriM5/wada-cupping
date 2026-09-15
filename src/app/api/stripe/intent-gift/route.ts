import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia",
});

export async function POST(request: Request) {
  try {
    const { serviceId, buyerEmail, buyerName } = await request.json();
    
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service introuvable");

    // Pour un bon cadeau découverte, on prend le prix de base à l'unité
    const amount = service.price * 100;

    const customers = await stripe.customers.list({ email: buyerEmail, limit: 1 });
    let customerId = customers.data.length > 0 
      ? customers.data[0].id 
      : (await stripe.customers.create({ email: buyerEmail, name: buyerName })).id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { serviceId, type: "gift_card" },
    });

    return NextResponse.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}