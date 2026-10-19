import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addYears } from "date-fns";
import { sendGiftCardEmail } from "@/lib/mailer"; 
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2026-08-26.dahlia" });



function generateGiftCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CADEAU-${code}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Dans POST :
    if (!data.stripeIntentId || !data.stripeIntentId.startsWith("pi_")) {
      return NextResponse.json({ success: false, error: "Paiement manquant" }, { status: 400 });
    }
    const intent = await stripe.paymentIntents.retrieve(data.stripeIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json({ success: false, error: "Paiement non validé" }, { status: 400 });
    }
    // 1. R cup ration du nom du service pour le mail
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    
    // 2. G n rer un code unique
    let uniqueCode = generateGiftCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.giftCard.findUnique({ where: { code: uniqueCode } });
      if (!existing) isUnique = true;
      else uniqueCode = generateGiftCode();
    }

    const expirationDate = addYears(new Date(), 1);

    // 3. Sauvegarde en base de donn es
    await prisma.giftCard.create({
      data: {
        code: uniqueCode,
        serviceId: data.serviceId,
        buyerEmail: data.buyerEmail,
        recipientName: data.recipientName,
        message: data.message || "",
        expiresAt: expirationDate, // Valable 1 an
      }
    });

    // --- 4. ENVOI DU MAIL MAGIQUE ---
    await sendGiftCardEmail(data.buyerEmail, {
      code: uniqueCode,
      serviceName: service?.name || "Rituel Bien- tre",
      recipientName: data.recipientName,
      message: data.message,
      expiresAt: expirationDate
    });

    return NextResponse.json({ success: true, code: uniqueCode });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Erreur lors de la cr ation du bon cadeau" }, { status: 500 });
  }
}