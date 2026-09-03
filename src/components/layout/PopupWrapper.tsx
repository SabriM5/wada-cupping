import prisma from "@/lib/prisma";
import PromoPopup from "./PromoPopup";

export default async function PopupWrapper() {
  // Récupère les codes promos actifs et la configuration globale
  const promos = await prisma.promoCode.findMany({ where: { isActive: true } });
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

  return <PromoPopup promos={promos} settings={settings} />;
}