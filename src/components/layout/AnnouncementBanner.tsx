import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AnnouncementBanner() {
  const activePromo = await prisma.promoCode.findFirst({ where: { isActive: true } });
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });

  const messages = [];
  if (activePromo) messages.push(`✨ OFFRE : -${activePromo.discountPercent}% avec le code ${activePromo.code}`);
  if (settings?.loyaltyRewardDesc) messages.push(`🎁 FIDÉLITÉ : ${settings.loyaltyRewardDesc} au bout de ${settings.loyaltyVisitsRequired} soins`);
  if (settings?.referralRewardReferred) messages.push(`🤝 PARRAINAGE : ${settings.referralRewardReferred}`);

  if (messages.length === 0) return null;

  const bannerText = messages.join("   •   ");

  return (
    <div className="fixed top-[88px] lg:top-[96px] w-full bg-secondary text-primary py-2 overflow-hidden flex whitespace-nowrap z-40 border-y border-primary/10 shadow-sm backdrop-blur-md">
      <Link href="/espace-client" className="animate-marquee pause-on-hover inline-block font-heading text-sm font-bold tracking-widest hover:text-white transition-colors cursor-pointer">
        {/* Répétition pour l'effet infini */}
        <span className="mx-8">{bannerText}</span>
        <span className="mx-8">{bannerText}</span>
        <span className="mx-8">{bannerText}</span>
        <span className="mx-8">{bannerText}</span>
      </Link>
    </div>
  );
}