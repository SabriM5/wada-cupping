"use client";
import { useState, useEffect } from "react";
import { X, Tag, Gift, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

export default function PromoPopup({ promos, settings }: any) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("wada_popup_seen");
    let timer: NodeJS.Timeout;
    
    if (!hasSeenPopup) {
      timer = setTimeout(() => setIsOpen(true), 5000);
    }

    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("openOffers", handleOpenEvent);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("openOffers", handleOpenEvent);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("wada_popup_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-white/40 backdrop-blur-md transition-opacity" onClick={handleClose}>
      {/* MODIFICATION ICI : max-w-lg devient max-w-md pour le rendre plus fin */}
      <div className="bg-white w-full max-w-md rounded-[30px] shadow-2xl relative overflow-hidden animate-fade-in-up border border-primary/10" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors bg-white rounded-full z-50 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* MODIFICATION : Paddings réduits (p-6 au lieu de p-10) */}
        <div className="bg-[#FAFAF7] text-primary p-6 md:p-8 text-center relative border-b border-primary/5">
          <Sparkles className="w-6 h-6 text-secondary absolute top-6 left-6 opacity-30" />
          <h2 className="font-heading text-2xl font-bold tracking-widest uppercase relative z-10 text-primary">Privilèges</h2>
          <p className="font-body text-primary/60 text-xs mt-2 relative z-10">Une parenthèse de douceur, rien que pour vous.</p>
        </div>

        {/* MODIFICATION : Paddings réduits (p-6 au lieu de p-8) */}
        <div className="p-6 space-y-6 bg-white">
          
          {promos.length > 0 && (
            <div>
              <h3 className="font-heading text-base font-bold text-primary flex items-center mb-3">
                <Tag className="w-4 h-4 mr-2 text-secondary" /> Offres du moment
              </h3>
              <div className="space-y-2">
                {promos.map((promo: any) => (
                  <div key={promo.id} className="flex justify-between items-center p-3 bg-secondary/10 border border-secondary/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-primary tracking-widest text-sm">{promo.code}</span>
                      <CopyToClipboard text={promo.code} className="text-primary/40 hover:text-primary" />
                    </div>
                    <span className="font-body font-bold text-secondary text-sm">-{promo.discountPercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODIFICATION : Marges et tailles de texte affinées */}
          <div className="bg-[#FAFAF7] p-6 rounded-2xl border border-primary/5 text-center">
            <div className="flex justify-center gap-3 mb-3 text-secondary/80">
              <Award className="w-6 h-6" />
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Le Cercle Privilège</h3>
            <p className="font-body text-xs text-primary/60 mb-6 leading-relaxed">
              Rejoignez notre programme. Cumulez vos séances pour débloquer votre récompense 
              ({settings?.loyaltyRewardDesc} dès {settings?.loyaltyVisitsRequired} soins) et parrainez vos proches.
            </p>

            <div className="flex flex-col gap-2">
              <Link href="/inscription" onClick={handleClose} className="w-full py-3 bg-secondary text-primary rounded-full font-body font-bold text-xs uppercase tracking-widest hover:bg-secondary/80 shadow-sm transition-all">
                Créer mon espace
              </Link>
              <Link href="/connexion" onClick={handleClose} className="w-full py-3 bg-transparent text-primary/70 rounded-full font-body font-bold text-xs uppercase tracking-widest hover:text-primary hover:bg-primary/5 transition-all">
                Me connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}