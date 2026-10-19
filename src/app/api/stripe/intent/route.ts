import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia",
});

export async function POST(request: Request) {
  try {
    // 1. On récupère le choix isCure
    const { serviceId, paymentType, promoCode, clientEmail, clientName, isCure } = await request.json();
    
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service introuvable");

    // 2. On définit le prix de base selon le choix
    const basePrice = (isCure && service.curePrice) ? service.curePrice : service.price;
    let finalPrice = basePrice;

    // --- RECALCUL SÉCURISÉ CÔTÉ SERVEUR ---
    if (promoCode) {
      const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
      
      if (promoCode === "FIDELITE") {
        const matchLoyalty = settings?.loyaltyRewardDesc?.match(/\d+/);
        const discountVal = matchLoyalty ? parseInt(matchLoyalty[0]) : 50;
        finalPrice = basePrice - (basePrice * discountVal) / 100; // Pourcentage
        
      } else if (promoCode === "RECOMPENSE") {
        const matchReward = settings?.referralRewardReferrer?.match(/\d+/);
        const rewardVal = matchReward ? parseInt(matchReward[0]) : 10;
        finalPrice = Math.max(0, basePrice - rewardVal); // Euros
        
      } else {
        const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
        if (promo && promo.isActive) {
          finalPrice = basePrice - (basePrice * promo.discountPercent) / 100; // Pourcentage
        } else {
          const referrer = await prisma.customerProfile.findFirst({
            where: { referralCode: { startsWith: promoCode, mode: "insensitive" } }
          });
          if (referrer) {
            const matchReferral = settings?.referralRewardReferred?.match(/\d+/);
            const refDiscount = matchReferral ? parseInt(matchReferral[0]) : 10;
            finalPrice = Math.max(0, basePrice - refDiscount); // Euros
          }
        }
      }
    }

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