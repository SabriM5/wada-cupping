import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.toUpperCase();
  const email = searchParams.get("email"); // L'email est désormais requis pour la fidélité

  if (!code) return NextResponse.json({ success: false, error: "Code manquant" });

  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

    // --- LOGIQUE 1 : LE CODE FIDÉLITÉ ---
    if (code === "FIDELITE") {
      if (!email || email.trim() === "undefined") {
        return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (Étape 3) avant d'appliquer ce code." });
      }

      const user = await prisma.user.findUnique({ where: { email }, include: { customerProfile: true } });
      const required = settings?.loyaltyVisitsRequired || 5;

      if (!user || !user.customerProfile) {
        return NextResponse.json({ success: false, error: "Aucun compte client associé à cet e-mail." });
      }

      if (user.customerProfile.visitsCount < required) {
        return NextResponse.json({ success: false, error: `Il vous manque encore des soins pour débloquer cette offre.` });
      }

      // On extrait automatiquement le chiffre depuis la description de l'Admin (ex: "-50%" -> 50)
      const matchLoyalty = settings?.loyaltyRewardDesc?.match(/\d+/);
      const discountVal = matchLoyalty ? parseInt(matchLoyalty[0]) : 50;

      return NextResponse.json({ 
        success: true, type: "LOYALTY", discount: discountVal, 
        message: `Récompense Fidélité appliquée ! (-${discountVal}%)` 
      });
    }

    // --- LOGIQUE 2 : LES CODES PROMOS CLASSIQUES ---
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    
    if (promo) {
      if (!promo.isActive) return NextResponse.json({ success: false, error: "Ce code a expiré ou est inactif." });
      
      // VÉRIFICATION STRICTE POUR LES CODES DE BIENVENUE
      if (code === "LANCEMENT" || code === "BIENVENUE") {
        if (!email || email.trim() === "undefined" || email.trim() === "") {
          return NextResponse.json({ success: false, error: "Veuillez entrer votre e-mail (Étape 3) pour vérifier votre éligibilité à l'offre découverte." });
        }
        
        // On vérifie si la cliente a déjà des rendez-vous non annulés
        const checkUser = await prisma.user.findUnique({ 
          where: { email }, 
          include: { appointments: { where: { status: { not: "CANCELLED" } } } } 
        });
        
        if (checkUser && checkUser.appointments.length > 0) {
          return NextResponse.json({ success: false, error: "Ce code est strictement réservé aux nouveaux clients (1ère séance)." });
        }
      }

      return NextResponse.json({ success: true, type: "PROMO", discount: promo.discountPercent, message: `Code appliqué : -${promo.discountPercent}%` });
    }

    // --- LOGIQUE 3 : LES CODES PARRAINS ---
    // CORRECTION : On utilise findFirst avec startsWith car l'Espace Client n'affiche que 8 caractères
    const referrer = await prisma.customerProfile.findFirst({ 
      where: { 
        referralCode: {
          startsWith: code,
          mode: "insensitive" // Ignore les majuscules/minuscules
        }
      },
      include: { user: true } 
    });
    
    if (referrer) {
      // Sécurité : Si la cliente essaie de se parrainer elle-même
      if (email && referrer.user && referrer.user.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Vous ne pouvez pas utiliser votre propre code de parrainage." });
      }

      const matchReferral = settings?.referralRewardReferred?.match(/\d+/);
      const refDiscount = matchReferral ? parseInt(matchReferral[0]) : 10;

      return NextResponse.json({ 
        success: true, type: "REFERRAL", discount: refDiscount, referrerId: referrer.id,
        message: `Parrainage validé ! (-${refDiscount}%)` 
      });
    }

    return NextResponse.json({ success: false, error: "Code introuvable ou invalide." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur serveur." });
  }
}