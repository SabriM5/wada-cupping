import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Privileges() {
  // 1. On récupère les réglages de fidélité et de parrainage
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  
  const visitsReq = settings?.loyaltyVisitsRequired || 5;
  const rewardDesc = settings?.loyaltyRewardDesc || "-50% sur votre soin";
  const refReferrer = settings?.referralRewardReferrer || "10€ offerts";
  const refReferred = settings?.referralRewardReferred || "10€ de réduction immédiate";

  // 2. NOUVEAU : On va chercher le dernier code promo actif créé par l'admin
  const activePromo = await prisma.promoCode.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. On construit la liste des privilèges dynamiquement
  const privilegesList = [];

  // Si un code promo existe, on l'ajoute en première position
  if (activePromo) {
    privilegesList.push({
      title: "L'Offre Privilège",
      content: (
        <>
          Bénéficiez de <strong>-{activePromo.discountPercent}%</strong> sur votre séance. Utilisez le code privilège <strong className="text-white font-medium">{activePromo.code}</strong> lors de votre réservation en ligne.
        </>
      )
    });
  }

  // On ajoute toujours la Fidélité et le Parrainage
  privilegesList.push({
    title: "Le Rituel Fidélité",
    content: (
      <>
        Votre bien-être s'inscrit dans la durée. Lors de votre {visitsReq}ème rendez-vous, WADA vous offre <strong className="text-white font-medium">{rewardDesc}</strong>. Le suivi s'effectue automatiquement dans votre espace personnel.
      </>
    )
  });

  privilegesList.push({
    title: "L'Art du Partage",
    content: (
      <>
        Faites découvrir l'expérience WADA à un proche. Offrez-lui <strong className="text-white font-medium">{refReferred}</strong>, et recevez <strong className="text-white font-medium">{refReferrer}</strong> sur votre prochain rituel en remerciement.
      </>
    )
  });

  return (
    <section className="py-32 bg-primary text-[#FAFAF7] relative overflow-hidden">
      {/* Halo lumineux subtil en arrière-plan pour la profondeur */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
          
          {/* Colonne Gauche : L'identité du Cercle (Fixe au scroll) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-6 block">
              Le Cercle Privilège
            </p>
            <h2 className="font-nimbus text-6xl md:text-7xl mb-8 leading-none tracking-widest">
              WADA
            </h2>
            <p className="font-heading italic text-[#FAFAF7]/70 text-xl md:text-2xl leading-relaxed mb-10 max-w-sm">
              L'excellence récompensée. <br/>
              Un programme confidentiel pensé pour sublimer votre fidélité.
            </p>
            <Link 
              href="/inscription" 
              className="inline-block border-b border-secondary/50 pb-1 font-body text-xs font-bold uppercase tracking-[0.2em] text-secondary hover:text-white hover:border-white transition-colors"
            >
              Rejoindre le cercle
            </Link>
          </div>

          {/* Colonne Droite : La liste dynamique des avantages */}
          <div className="lg:col-span-7 lg:pl-10 space-y-0 border-t border-white/10">
            
            {privilegesList.map((item, index) => (
              <div key={index} className="py-12 border-b border-white/10 flex flex-col md:flex-row md:items-start gap-6 group">
                <div className="font-nimbus text-5xl text-white/10 group-hover:text-secondary/50 transition-colors md:w-24 shrink-0 mt-[-8px]">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold mb-4 tracking-wide uppercase text-white/90">
                    {item.title}
                  </h3>
                  <p className="font-body text-[#FAFAF7]/60 leading-relaxed text-sm md:text-base">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}