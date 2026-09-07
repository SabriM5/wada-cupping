import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.toUpperCase();
  const email = searchParams.get("email");

  if (!code) return NextResponse.json({ success: false, error: "Code manquant" });

  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

    // --- 1. LOGIQUE CAGNOTTE PARRAIN (RECOMPENSE) ---
    if (code === "RECOMPENSE") {
      if (!email || email.trim() === "undefined") return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (étape 3)." });
      
      const user = await prisma.user.findUnique({ where: { email }, include: { customerProfile: true } });
      if (!user || !user.customerProfile) return NextResponse.json({ success: false, error: "Aucun compte client associé à cet e-mail." });
      
      if (user.customerProfile.referralRewards <= 0) {
        return NextResponse.json({ success: false, error: "Votre cagnotte de parrainage est vide." });
      }

      const matchReferrer = settings?.referralRewardReferrer?.match(/\d+/);
      const rewardVal = matchReferrer ? parseInt(matchReferrer[0]) : 10;
      return NextResponse.json({ success: true, type: "REWARD", discount: rewardVal, message: `Cagnotte utilisée ! (-${rewardVal}€)` });
    }

    // --- 2. LOGIQUE FIDÉLITÉ ---
    if (code === "FIDELITE") {
      if (!email || email.trim() === "undefined") return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (étape 3)." });
      const user = await prisma.user.findUnique({ where: { email }, include: { customerProfile: true } });
      const required = settings?.loyaltyVisitsRequired || 5;
      
      if (!user || !user.customerProfile) return NextResponse.json({ success: false, error: "Aucun compte client." });
      if (user.customerProfile.visitsCount < required) return NextResponse.json({ success: false, error: `Il vous manque encore des soins.` });

      const matchLoyalty = settings?.loyaltyRewardDesc?.match(/\d+/);
      const discountVal = matchLoyalty ? parseInt(matchLoyalty[0]) : 50;
      return NextResponse.json({ success: true, type: "LOYALTY", discount: discountVal, message: `Récompense Fidélité ! (-${discountVal}%)` });
    }

    // --- 3. LOGIQUE CODES PROMOS (ADMIN) ---
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (promo) {
      if (!promo.isActive) return NextResponse.json({ success: false, error: "Ce code a expiré." });
      if (code === "LANCEMENT" || code === "BIENVENUE") {
        if (!email || email.trim() === "undefined" || email.trim() === "") return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (étape 3)." });
        const checkUser = await prisma.user.findUnique({ where: { email }, include: { appointments: { where: { status: { not: "CANCELLED" } } } } });
        if (checkUser && checkUser.appointments.length > 0) return NextResponse.json({ success: false, error: "Code réservé aux nouveaux clients." });
      }
      return NextResponse.json({ success: true, type: "PROMO", discount: promo.discountPercent, message: `Code appliqué : -${promo.discountPercent}%` });
    }

    // --- 4. LOGIQUE FILLEUL (Code Parrain Ex: AMIRA8X) ---
    const referrer = await prisma.customerProfile.findFirst({ 
      where: { referralCode: { startsWith: code, mode: "insensitive" } },
      include: { user: true } 
    });

    if (referrer) {
      if (email && referrer.user && referrer.user.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Vous ne pouvez pas utiliser votre propre code." });
      }
      if (!email || email.trim() === "undefined" || email.trim() === "") {
        return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (étape 3)." });
      }

      const checkFilleul = await prisma.user.findUnique({ 
        where: { email }, 
        include: { appointments: { where: { status: { not: "CANCELLED" } } } } 
      });
      if (checkFilleul && checkFilleul.appointments.length > 0) {
        return NextResponse.json({ success: false, error: "Ce code est réservé aux nouveaux clients." });
      }

      const matchReferral = settings?.referralRewardReferred?.match(/\d+/);
      const refDiscount = matchReferral ? parseInt(matchReferral[0]) : 10;
      return NextResponse.json({ success: true, type: "REFERRAL", discount: refDiscount, referrerId: referrer.id, message: `Parrainage validé ! (-${refDiscount}€)` });
    }

    return NextResponse.json({ success: false, error: "Code introuvable." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur serveur." });
  }
}