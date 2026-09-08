import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BookingSchema } from "@/schemas/booking.schema";
import { addMinutes } from "date-fns";
import { sendClientConfirmation, sendAdminNotification } from "@/lib/mailer";
import Stripe from "stripe";

// Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validation stricte
    const validatedData = BookingSchema.parse(body);
    const { serviceId, startsAt, clientName, clientEmail, clientPhone, clientAddress, clientCity, clientZipCode, stripeIntentId, promoCodeUsed, isCure } = validatedData;
    // --- NOUVEAU : VÉRIFICATION DE SÉCURITÉ STRIPE ---
    if (!stripeIntentId) {
      throw new Error("Transaction bancaire manquante ou invalide.");
    }

    // Le serveur interroge Stripe pour vérifier si le paiement/empreinte a vraiment réussi
    if (stripeIntentId.startsWith('pi_')) {
      const intent = await stripe.paymentIntents.retrieve(stripeIntentId);
      if (intent.status !== 'succeeded') throw new Error("Le paiement n'a pas été validé par la banque.");
    } else if (stripeIntentId.startsWith('seti_')) {
      const intent = await stripe.setupIntents.retrieve(stripeIntentId);
      if (intent.status !== 'succeeded') throw new Error("L'empreinte bancaire n'a pas été validée.");
    } else {
      throw new Error("Identifiant de transaction falsifié.");
    }
    // -------------------------------------------------

    // On recompose l'adresse complète pour l'historique et les emails
    const fullAddress = `${clientAddress}, ${clientZipCode} ${clientCity}`;
    
    const requestedStart = new Date(startsAt);
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new Error("Service introuvable");
    
    const requestedEnd = addMinutes(requestedStart, service.durationMin);
    const requestedEndWithBuffer = addMinutes(requestedEnd, service.bufferMin);

    // 2. Transaction de réservation
    const newAppointment = await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          status: { not: "CANCELLED" },
          OR: [
            { startsAt: { lt: requestedEndWithBuffer }, endsAt: { gt: requestedStart } }
          ]
        }
      });

      if (conflict) {
        throw new Error("Ce créneau vient juste d'être réservé.");
      }

      let user = await tx.user.findUnique({ where: { email: clientEmail } });
      
      if (!user) {
        user = await tx.user.create({
          data: {
            email: clientEmail,
            passwordHash: "", 
            role: "CUSTOMER",
            customerProfile: {
              create: {
                firstName: clientName.split(" ")[0] || "Client",
                lastName: clientName.split(" ").slice(1).join(" ") || "",
                phone: clientPhone,
                address: clientAddress,
                city: clientCity,
                zipCode: clientZipCode
              }
            }
          }
        });
      }

      const appointment = await tx.appointment.create({
     data: {
       startsAt: requestedStart,
       endsAt: requestedEnd,
       serviceId: serviceId,
       userId: user.id,
       snapshotAddress: fullAddress,
       snapshotPhone: clientPhone,
       promoCodeUsed: promoCodeUsed || null,
       isCure: isCure || false
     }
   });

   // --- NOUVEAU : GESTION DES CAGNOTTES ---
   if (promoCodeUsed) {
     if (promoCodeUsed === "RECOMPENSE") {
       // Le parrain utilise sa cagnotte : on lui retire 1 point
       await tx.customerProfile.update({
         where: { userId: user.id },
         data: { referralRewards: { decrement: 1 } }
       });
     } else if (promoCodeUsed !== "FIDELITE" && promoCodeUsed !== "LANCEMENT" && promoCodeUsed !== "BIENVENUE") {
       // C'est un code parrain (ex: AMIRA8X) : on cherche le parrain
       const referrer = await tx.customerProfile.findFirst({
         where: { referralCode: { startsWith: promoCodeUsed, mode: "insensitive" } }
       });
       // On crédite le parrain de 1 point (s'il ne s'auto-parraine pas)
       if (referrer && referrer.userId !== user.id) {
         await tx.customerProfile.update({
           where: { id: referrer.id },
           data: { referralRewards: { increment: 1 } }
         });
       }
     }
   }

   return appointment;
});

    // 3. Envoi des Emails en arrière-plan (ne bloque pas la réponse)
    // 3. Envoi des Emails en arrière-plan
    try {
      const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
      const emailData = { 
        startsAt, 
        clientName, 
        clientEmail, 
        clientAddress: fullAddress,
        cancelHours: settings?.cancellationNoticeHours || 24,
        cancelPenalty: settings?.cancellationPenaltyPercent || 20
      };
      
      await sendClientConfirmation(emailData, service);
      await sendAdminNotification(emailData, service);
    } catch (emailError) {
      console.error("Échec de l'envoi des emails :", emailError);
    }

    return NextResponse.json({ success: true, data: newAppointment });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 409 });
  }
}