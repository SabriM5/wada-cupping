"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- ACTION 1 : CHANGER LES IDENTIFIANTS ---
export async function updateAdminCredentials(formData: FormData) {
  const session = await auth();
  
  // CORRECTION : On utilise redirect() au lieu de return { error: ... }
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/parametres?error=" + encodeURIComponent("Non autorisé"));
  }

  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;
  const dataToUpdate: any = {};

  if (email) dataToUpdate.email = email;
  if (newPassword && newPassword.length >= 8) {
    dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  let isSuccess = false;
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate
    });
    isSuccess = true;
  } catch (e) {
    isSuccess = false;
  }

  if (!isSuccess) {
    redirect("/admin/parametres?error=" + encodeURIComponent("Cet e-mail est peut-être déjà utilisé."));
  }

  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?success=credentials");
}

// --- ACTION 2 : CRÉER UN CODE PROMO ---
export async function createPromoCode(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const code = formData.get("code") as string;
  const discount = parseInt(formData.get("discountPercent") as string);
  
  if (!code || !discount) return;

  await prisma.promoCode.create({
    data: { code: code.toUpperCase().trim(), discountPercent: discount, isActive: true }
  });
  revalidatePath("/admin/promotions");
}

// --- ACTION 3 : ACTIVER/DÉSACTIVER UN CODE ---
export async function togglePromoStatus(id: string, currentStatus: boolean) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  await prisma.promoCode.update({
    where: { id },
    data: { isActive: !currentStatus }
  });
  revalidatePath("/admin/promotions");
}

// --- ACTION 4 : PARAMÈTRES MARKETING ---
// --- ACTION 4 : PARAMÈTRES MARKETING & ANNULATION ---
export async function updateMarketingSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/parametres?error=" + encodeURIComponent("Non autorisé"));
  }

  // Variables Fidélité & Parrainage
  const visits = parseInt(formData.get("loyaltyVisitsRequired") as string);
  const loyaltyDesc = formData.get("loyaltyRewardDesc") as string;
  const refReferrer = formData.get("referralRewardReferrer") as string;
  const refReferred = formData.get("referralRewardReferred") as string;

  // Nouvelles Variables d'Annulation
  const cancelHours = parseInt(formData.get("cancellationNoticeHours") as string) || 24;
  const cancelPenalty = parseInt(formData.get("cancellationPenaltyPercent") as string) || 20;

  await prisma.systemSettings.upsert({
    where: { id: "global" },
    update: {
      loyaltyVisitsRequired: visits,
      loyaltyRewardDesc: loyaltyDesc,
      referralRewardReferrer: refReferrer,
      referralRewardReferred: refReferred,
      cancellationNoticeHours: cancelHours,
      cancellationPenaltyPercent: cancelPenalty
    },
    create: {
      id: "global",
      loyaltyVisitsRequired: visits,
      loyaltyRewardDesc: loyaltyDesc,
      referralRewardReferrer: refReferrer,
      referralRewardReferred: refReferred,
      cancellationNoticeHours: cancelHours,
      cancellationPenaltyPercent: cancelPenalty
    }
  });
  
  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?success=marketing");
}