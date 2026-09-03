import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia", // Assure-toi que cette version correspond à celle de ton compte Stripe
});

export async function POST(request: Request) {
  try {
    const { serviceId, paymentType, promoCode, clientEmail, clientName } = await request.json();

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service introuvable");

    let discountPercent = 0;

    // --- RECALCUL SÉCURISÉ DE LA RÉDUCTION CÔTÉ SERVEUR ---
    if (promoCode) {
      const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
      
      if (promoCode === "FIDELITE") {
        const matchLoyalty = settings?.loyaltyRewardDesc?.match(/\d+/);
        discountPercent = matchLoyalty ? parseInt(matchLoyalty[0]) : 50;
      } else {
        const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
        if (promo && promo.isActive) {
          discountPercent = promo.discountPercent;
        } else {
          const referrer = await prisma.customerProfile.findFirst({
            where: { referralCode: { startsWith: promoCode, mode: "insensitive" } }
          });
          if (referrer) {
            const matchReferral = settings?.referralRewardReferred?.match(/\d+/);
            discountPercent = matchReferral ? parseInt(matchReferral[0]) : 10;
          }
        }
      }
    }

    const finalPrice = service.price - (service.price * discountPercent) / 100;

    // 1. Chercher si la cliente existe déjà sur Stripe, sinon la créer
    const customers = await stripe.customers.list({ email: clientEmail, limit: 1 });
    let customerId = customers.data.length > 0 
      ? customers.data[0].id 
      : (await stripe.customers.create({ email: clientEmail, name: clientName })).id;

    if (paymentType === "full") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalPrice * 100),
        currency: "eur",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: { serviceId, paymentType },
      });
      return NextResponse.json({ success: true, clientSecret: paymentIntent.client_secret, type: "payment" });
      
    } else {
      const penaltyAmount = Math.round(finalPrice * 0.2 * 100);
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session", 
        payment_method_types: ['card'],
        metadata: { serviceId, paymentType, cancelFee: penaltyAmount },
      });
      return NextResponse.json({ success: true, clientSecret: setupIntent.client_secret, type: "setup" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}