"use client";

import { useState } from "react";
import { Loader2, Gift } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "@/components/booking/StripeCheckout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function GiftCardForm({ services }: { services: any[] }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: "",
    buyerName: "",
    buyerEmail: "",
    recipientName: "",
    message: ""
  });
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedService = services.find(s => s.id === formData.serviceId);

  const handleProceedToPayment = async () => {
    if (!formData.serviceId || !formData.buyerName || !formData.buyerEmail || !formData.recipientName) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires avec (*).");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/stripe/intent-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setClientSecret(json.clientSecret);
        setStep(2);
      } else {
        setErrorMsg(json.error || "Erreur de paiement.");
      }
    } catch (err) {
      setErrorMsg("Serveur injoignable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizePurchase = async () => {
    try {
      const res = await fetch("/api/giftcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedCode(json.code);
        setStep(3);
      } else {
        setErrorMsg("Erreur lors de la génération du code.");
      }
    } catch (err) {
      setErrorMsg("Serveur injoignable.");
    }
  };

  // ÉCRAN DE SUCCÈS
  if (step === 3) {
    return (
      <div className="bg-surface p-12 rounded-[40px] text-center shadow-soft border border-primary/20 animate-fade-in-up">
        <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Gift className="w-12 h-12 text-secondary" />
        </div>
        <h2 className="text-4xl font-heading text-primary font-bold mb-4">Cadeau validé !</h2>
        <p className="text-primary/70 mb-8 font-body">Le bon cadeau a été généré avec succès.</p>
        
        <div className="bg-primary text-secondary p-8 rounded-3xl inline-block mb-8 shadow-xl">
          <p className="text-sm uppercase tracking-widest text-white/60 mb-3 font-body">Code à transmettre au bénéficiaire :</p>
          <p className="font-heading text-5xl font-bold tracking-widest">{generatedCode}</p>
        </div>
        
        <p className="text-sm text-primary/60 max-w-lg mx-auto font-body leading-relaxed">
          La personne qui recevra ce cadeau devra simplement entrer ce code dans la case "Code Promo" lors de sa réservation sur notre site. L'étape de paiement sera alors automatiquement masquée.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
      <div className="lg:col-span-2 space-y-8">
        
        {/* ÉTAPE 1 : CHOIX ET INFOS */}
        {step === 1 && (
          <div className="bg-surface p-8 md:p-12 rounded-[40px] shadow-soft border border-primary/20">
            <h3 className="font-heading text-2xl text-primary mb-8 border-b border-primary/10 pb-4">1. Le Rituel Offert</h3>
            
            <div className="grid grid-cols-1 gap-4 mb-12">
              {services.map(s => (
                <label key={s.id} className={`p-5 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${formData.serviceId === s.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-border hover:border-primary/40'}`}>
                  <input type="radio" name="service" className="hidden" checked={formData.serviceId === s.id} onChange={() => setFormData({...formData, serviceId: s.id})} />
                  <div>
                    <span className="block font-heading font-bold text-lg text-primary">{s.name}</span>
                    <span className="text-xs font-body text-primary/60 uppercase tracking-wider">{s.durationMin} minutes</span>
                  </div>
                  <span className="font-heading font-bold text-2xl text-primary">{s.price} €</span>
                </label>
              ))}
            </div>

            <h3 className="font-heading text-2xl text-primary mb-8 border-b border-primary/10 pb-4">2. Les Informations</h3>
            <div className="space-y-6 font-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-primary/80 mb-2">Votre nom *</label>
                  <input type="text" value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-primary/80 mb-2">Votre e-mail *</label>
                  <input type="email" value={formData.buyerEmail} onChange={e => setFormData({...formData, buyerEmail: e.target.value})} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-primary/80 mb-2">Nom du bénéficiaire *</label>
                <input type="text" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm text-primary/80 mb-2">Un petit mot pour l'accompagner (optionnel)</label>
                <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none min-h-[100px]" />
              </div>
              
              {errorMsg && <p className="text-red-500 text-sm mt-4 font-bold">{errorMsg}</p>}

              <button onClick={handleProceedToPayment} disabled={isSubmitting} className="w-full mt-8 py-5 rounded-full font-body font-bold uppercase tracking-widest text-[#FAFAF7] bg-primary hover:bg-primary/90 transition-all flex justify-center items-center">
                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sécurisation...</> : "Procéder au paiement"}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : STRIPE */}
        {step === 2 && clientSecret && (
          <div className="bg-surface p-8 md:p-12 rounded-[40px] shadow-soft border border-primary/20 animate-fade-in-up">
            <h3 className="font-heading text-2xl text-primary mb-8 border-b border-primary/10 pb-4">Paiement Sécurisé</h3>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <StripeCheckout onSuccess={finalizePurchase} type="payment" />
            </Elements>
            <button onClick={() => setStep(1)} className="mt-8 text-primary/60 hover:text-primary transition font-body font-medium text-sm">Retour au formulaire</button>
          </div>
        )}
      </div>

      {/* COLONNE DROITE : RÉCAPITULATIF */}
      <div className="lg:col-span-1">
        <div className="bg-primary text-[#FAFAF7] p-10 rounded-[40px] shadow-xl sticky top-32">
          <h3 className="font-heading text-2xl mb-8 pb-6 border-b border-[#FAFAF7]/20 uppercase tracking-widest text-center">Bon Cadeau</h3>
          
          <div className="space-y-6 font-heading text-lg text-[#FAFAF7]/90 mb-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-secondary mb-1">Soin offert</p>
              <p className="font-bold">{selectedService ? selectedService.name : "À sélectionner"}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-secondary mb-1">Bénéficiaire</p>
              <p className="font-bold">{formData.recipientName || "..."}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#FAFAF7]/20 flex justify-between items-end">
            <span className="font-heading text-xl uppercase tracking-widest">Total</span>
            <span className="font-heading text-3xl font-bold text-secondary">{selectedService ? `${selectedService.price} €` : "--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}