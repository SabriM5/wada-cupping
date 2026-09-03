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
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden animate-fade-in-up border border-primary/10" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors bg-white rounded-full z-50 cursor-pointer">
          <X className="w-6 h-6" />
        </button>

        {/* En-tête lumineux et accueillant */}
        <div className="bg-[#FAFAF7] text-primary p-10 text-center relative border-b border-primary/5">
          <Sparkles className="w-8 h-8 text-secondary absolute top-6 left-10 opacity-30" />
          <h2 className="font-heading text-3xl font-bold tracking-widest uppercase relative z-10 text-primary">Privilèges</h2>
          <p className="font-body text-primary/60 text-sm mt-3 relative z-10">Une parenthèse de douceur, rien que pour vous.</p>
        </div>

        <div className="p-8 space-y-8 bg-white">
          
          {promos.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-bold text-primary flex items-center mb-4">
                <Tag className="w-5 h-5 mr-2 text-secondary" /> Offres du moment
              </h3>
              <div className="space-y-3">
                {promos.map((promo: any) => (
                  <div key={promo.id} className="flex justify-between items-center p-4 bg-secondary/10 border border-secondary/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-primary tracking-widest">{promo.code}</span>
                      <CopyToClipboard text={promo.code} className="text-primary/40 hover:text-primary" />
                    </div>
                    <span className="font-body font-bold text-secondary text-sm">-{promo.discountPercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#FAFAF7] p-8 rounded-3xl border border-primary/5 text-center">
            <div className="flex justify-center gap-3 mb-4 text-secondary/80">
              <Award className="w-8 h-8" />
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-primary mb-2">Le Cercle Privilège</h3>
            <p className="font-body text-sm text-primary/60 mb-8 leading-relaxed">
              Rejoignez notre programme de fidélité. Cumulez vos séances pour débloquer votre récompense exclusive 
              ({settings?.loyaltyRewardDesc} dès {settings?.loyaltyVisitsRequired} soins) et parrainez vos proches pour des avantages immédiats.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/inscription" onClick={handleClose} className="w-full py-4 bg-secondary text-primary rounded-full font-body font-bold text-sm uppercase tracking-widest hover:bg-secondary/80 shadow-md transition-all">
                Créer mon espace
              </Link>
              <Link href="/connexion" onClick={handleClose} className="w-full py-4 bg-transparent text-primary/70 rounded-full font-body font-bold text-sm uppercase tracking-widest hover:text-primary hover:bg-primary/5 transition-all">
                Me connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}