"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingSchema, BookingFormData } from "@/schemas/booking.schema";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, AlertCircle, Loader2, Lock, CreditCard, Banknote } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "./StripeCheckout";

// Initialisation Stripe Front-end
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BookingForm({ services }: { services: any[] }) {
  const searchParams = useSearchParams();
  const isBankRedirectSuccess = searchParams.get("success") === "true";

  // 1. TOUTES LES VARIABLES D'ÉTAT (useState) EN PREMIER
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [clientSecretType, setClientSecretType] = useState<"payment" | "setup">("payment");
  const [paymentChoice, setPaymentChoice] = useState<"full" | "hold">("full");
  const [isCure, setIsCure] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code?: string, discount?: number, message: string, type: string } | null>(null);
  const [promoStatusMsg, setPromoStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [cancelRules, setCancelRules] = useState({ hours: 24, penalty: 20 });

  // 2. INITIALISATION DU FORMULAIRE
  const form = useForm<BookingFormData>({
    resolver: zodResolver(BookingSchema),
    defaultValues: { termsAccepted: true, isCure: false },
  });

  const watchServiceId = form.watch("serviceId");
  const watchStartsAt = form.watch("startsAt");

  // 3. CALCULS DÉRIVÉS (Maintenant que toutes les variables existent)
  const selectedService = services.find((s) => s.id === watchServiceId);
  
  const basePrice = selectedService 
    ? (isCure && selectedService.curePrice ? selectedService.curePrice : selectedService.price) 
    : 0;
    
  const finalPrice = basePrice 
    ? (appliedPromo?.discount ? basePrice - (basePrice * appliedPromo.discount / 100) : basePrice) 
    : 0;
    
  const penaltyAmount = (finalPrice * 0.2).toFixed(2);

  // 4. EFFETS (useEffect)
  useEffect(() => { setIsCure(false); }, [watchServiceId]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setCancelRules(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (watchServiceId && selectedDate) {
      fetchSlots(selectedDate, watchServiceId);
      form.setValue("startsAt", "");
    }
  }, [selectedDate, watchServiceId]);

  const fetchSlots = async (date: string, serviceId: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${date}&serviceId=${serviceId}`);
      const json = await res.json();
      if (json.success) setAvailableSlots(json.data.map((d: string) => new Date(d)));
      else setAvailableSlots([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleApplyPromo = async () => {
    setPromoStatusMsg(null);
    if (!promoInput.trim()) return;

    // On récupère l'email tapé dans le formulaire à l'étape 3
    const currentEmail = form.getValues("clientEmail"); 

    try {
      const res = await fetch(`/api/promos/validate?code=${promoInput.trim()}&email=${encodeURIComponent(currentEmail || "")}`);
      const json = await res.json();
      
      if (json.success) {
        setAppliedPromo({ code: promoInput.trim().toUpperCase(), discount: json.discount, message: json.message, type: json.type });        setPromoStatusMsg({ type: 'success', text: json.message });
      } else {
        setPromoStatusMsg({ type: 'error', text: json.error });
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoStatusMsg({ type: 'error', text: "Erreur de vérification." });
    }
  };

  const handleProceedToPayment = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/stripe/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serviceId: data.serviceId, 
          paymentType: paymentChoice, 
          promoCode: appliedPromo?.code || null, // NOUVEAU : On envoie le texte, le serveur fera le calcul
          clientEmail: data.clientEmail,
          clientName: data.clientName,
          isCure: isCure,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setClientSecret(json.clientSecret);
        setClientSecretType(json.type);
        setStep(4);
      } else {
        setErrorMsg(json.error || "Impossible d'initialiser la sécurité bancaire.");
      }
    } catch (err) {
      setErrorMsg("Serveur de paiement injoignable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeBooking = async () => {
    const data = form.getValues();
    const intentId = clientSecret?.split('_secret_')[0]; 

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, stripeIntentId: intentId, promoCodeUsed: appliedPromo?.code || null, isCure }),
      });
      const json = await res.json();
      if (json.success) setSuccess(true);
      else setErrorMsg(json.error || "Paiement réussi mais échec de l'enregistrement du RDV.");
    } catch (err) {
      setErrorMsg("Erreur lors de la validation finale du RDV.");
    }
  };

  // 1. Affichage du succès (Déclenché soit par React, soit par l'URL après un retour de banque)
  if (success || isBankRedirectSuccess) {
    return (
      <div className="bg-surface p-16 rounded-[40px] shadow-soft border border-border text-center max-w-2xl mx-auto animate-fade-in-up">
        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-4xl font-heading text-primary font-bold mb-6">Réservation confirmée</h2>
        <p className="text-primary/70 font-heading text-lg mb-10 leading-relaxed">
          La transaction a été validée avec succès. Votre rituel est confirmé et un e-mail récapitulatif vient de vous être envoyé.
        </p>
        <button onClick={() => window.location.href = '/'} className="px-10 py-4 rounded-full font-body font-bold uppercase tracking-widest text-[#FAFAF7] bg-primary hover:bg-primary/90 transition-all duration-300">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
      
      {/* 2. Remplacement de <form> par <div className="..."> */}
      {/* Colonne Gauche : Le Formulaire */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* SEULES LES ÉTAPES 1 À 3 SONT DANS LE FORMULAIRE PRINCIPAL */}
        <form id="booking-form" onSubmit={form.handleSubmit(handleProceedToPayment)} className="space-y-8">
          
          {/* ÉTAPE 1 : RITUEL */}
          <div className={`p-8 md:p-12 rounded-[40px] transition-all duration-500 ${step === 1 ? 'bg-surface shadow-soft border border-primary/20' : 'bg-transparent border border-primary/10 opacity-60'}`}>
            <h2 className="font-heading text-2xl mb-8 flex items-center text-primary">
              <span className={`font-body text-sm w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step === 1 ? 'bg-primary text-white' : 'border border-primary/30 text-primary/50'}`}>1</span>
              Le Rituel
            </h2>
            {step === 1 && (
              <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                  <div key={service.id} className={`p-6 rounded-2xl border transition-all duration-300 ${watchServiceId === service.id ? 'bg-primary/5 border-primary' : 'border-border hover:border-primary/40'}`}>
                    
                    {/* Le bouton principal du soin */}
                    <label className="flex justify-between items-center cursor-pointer">
                      <input type="radio" value={service.id} {...form.register("serviceId")} className="hidden" />
                      <div>
                        <span className="block font-heading text-xl font-bold text-primary mb-1">{service.name}</span>
                        <span className="text-sm text-primary/60 font-body uppercase tracking-wider">{service.durationMin} minutes</span>
                      </div>
                      <span className="font-heading text-2xl text-primary">{service.price} €</span>
                    </label>

                    {/* L'APPARITION MAGIQUE DES CURES : Si le soin a une cure, on affiche les options */}
                    {watchServiceId === service.id && service.curePrice && (
                      <div className="mt-6 pt-6 border-t border-primary/10 flex flex-col gap-3 animate-fade-in-up">
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">Format de la séance</p>
                        
                        <label className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${!isCure ? 'bg-white border-primary shadow-sm' : 'bg-transparent border-border hover:border-primary/30'}`}>
                          <input type="radio" checked={!isCure} onChange={() => setIsCure(false)} className="mr-3 accent-primary w-4 h-4" />
                          <span className="flex-1 font-bold text-sm text-primary">Soin à l'unité</span>
                          <span className="font-heading font-bold text-primary">{service.price} €</span>
                        </label>

                        <label className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${isCure ? 'bg-white border-secondary shadow-sm' : 'bg-transparent border-border hover:border-secondary/30'}`}>
                          <input type="radio" checked={isCure} onChange={() => setIsCure(true)} className="mr-3 accent-secondary w-4 h-4" />
                          <div>
                            <span className="block font-bold text-sm text-primary">{service.cureName}</span>
                            <span className="text-xs text-primary/60">{service.cureSessions} séances</span>
                          </div>
                          <span className="font-heading font-bold text-secondary text-lg">{service.curePrice} €</span>
                        </label>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
            {step === 1 && watchServiceId && (
              <button type="button" onClick={() => setStep(2)} className="mt-10 px-8 py-3 rounded-full font-body text-white bg-primary hover:bg-primary/90 transition-all">
                Étape suivante
              </button>
            )}
          </div>

          {/* ÉTAPE 2 : CRÉNEAU */}
          <div className={`p-8 md:p-12 rounded-[40px] transition-all duration-500 ${step === 2 ? 'bg-surface shadow-soft border border-primary/20' : 'bg-transparent border border-primary/10 opacity-60'}`}>
            <h2 className="font-heading text-2xl mb-8 flex items-center text-primary">
              <span className={`font-body text-sm w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step === 2 ? 'bg-primary text-white' : 'border border-primary/30 text-primary/50'}`}>2</span>
              Le Créneau
            </h2>
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block font-heading text-lg text-primary mb-4">Date souhaitée</label>
                  <input type="date" min={format(new Date(), "yyyy-MM-dd")} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full sm:w-auto p-4 border border-border rounded-xl bg-transparent text-primary focus:border-primary outline-none font-body" />
                </div>
                <div>
                  <label className="block font-heading text-lg text-primary mb-4">Heures disponibles</label>
                  {isLoadingSlots ? (
                    <div className="flex items-center text-primary/60 font-body"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Recherche...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableSlots.map((slot, idx) => (
                        <label key={idx} className={`cursor-pointer border p-3 rounded-xl text-center font-body transition-all ${watchStartsAt === slot.toISOString() ? 'bg-primary text-white border-primary' : 'bg-transparent border-border text-primary hover:border-primary/40'}`}>
                          <input type="radio" value={slot.toISOString()} {...form.register("startsAt")} className="hidden" />
                          {format(slot, "HH:mm")}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary/60 font-body italic">Aucun créneau disponible.</p>
                  )}
                </div>
                <div className="flex gap-4 pt-4 border-t border-border">
                  <button type="button" onClick={() => setStep(1)} className="text-primary/60 hover:text-primary transition font-body font-medium px-4 py-3">Retour</button>
                  {watchStartsAt && <button type="button" onClick={() => setStep(3)} className="px-8 py-3 rounded-full font-body text-white bg-primary hover:bg-primary/90 transition-all">Étape suivante</button>}
                </div>
              </div>
            )}
          </div>

          {/* ÉTAPE 3 : COORDONNÉES */}
          <div className={`p-8 md:p-12 rounded-[40px] transition-all duration-500 ${step === 3 ? 'bg-surface shadow-soft border border-primary/20' : 'bg-transparent border border-primary/10 opacity-60'}`}>
            <h2 className="font-heading text-2xl mb-8 flex items-center text-primary">
              <span className={`font-body text-sm w-8 h-8 rounded-full flex items-center justify-center mr-4 ${step === 3 ? 'bg-primary text-white' : 'border border-primary/30 text-primary/50'}`}>3</span>
              Vos Coordonnées
            </h2>
            
            {step === 3 && (
              <div className="space-y-6 font-body">
                <div>
                  <label className="block text-sm text-primary/80 mb-2">Nom complet *</label>
                  <input {...form.register("clientName")} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                  {form.formState.errors.clientName && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientName.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-primary/80 mb-2">Email *</label>
                    <input type="email" {...form.register("clientEmail")} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                    {form.formState.errors.clientEmail && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-primary/80 mb-2">Téléphone *</label>
                    <input type="tel" {...form.register("clientPhone")} className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                    {form.formState.errors.clientPhone && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientPhone.message}</p>}
                  </div>
                </div>
                
                {/* L'adresse détaillée */}
                <div>
                  <label className="block text-sm text-primary/80 mb-2">Adresse de l'intervention *</label>
                  <input {...form.register("clientAddress")} placeholder="Ex: 12 rue des lilas" className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                  {form.formState.errors.clientAddress && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientAddress.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-primary/80 mb-2">Code Postal *</label>
                    <input type="text" {...form.register("clientZipCode")} placeholder="Ex: 91700" className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                    {form.formState.errors.clientZipCode && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientZipCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-primary/80 mb-2">Ville *</label>
                    <input type="text" {...form.register("clientCity")} placeholder="Ex: Sainte-Geneviève-des-Bois" className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
                    {form.formState.errors.clientCity && <p className="text-red-500 text-xs mt-2">{form.formState.errors.clientCity.message}</p>}
                  </div>
                </div>

                {/* LA CASE À COCHER OBLIGATOIRE (CGV) */}
                <div className="pt-4">
                  <label className="flex items-start cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                      <input 
                        type="checkbox" 
                        {...form.register("termsAccepted")} 
                        className="peer appearance-none w-5 h-5 border-2 border-border rounded-md checked:bg-secondary checked:border-secondary transition-all"
                      />
                      <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-primary/80 leading-relaxed">
                      J'accepte les <a href="/legal" target="_blank" className="text-secondary font-bold hover:underline">Conditions Générales de Vente</a> et je reconnais que toute annulation à moins de {cancelRules.hours}h entraînera un prélèvement automatique de {cancelRules.penalty}% des frais.
                    </span>
                  </label>
                  {form.formState.errors.termsAccepted && (
                    <p className="text-red-500 text-xs mt-2 ml-8">{form.formState.errors.termsAccepted.message}</p>
                  )}
                </div>
                {/* NOUVEAU : BLOC CODE PROMO INTÉGRÉ AU FORMULAIRE */}
                <div className="pt-6 mt-6 border-t border-border">
                  <label className="block text-sm text-primary/80 mb-2">Code Promo ou Parrainage (Optionnel)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput} 
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())} 
                      placeholder="Ex: LANCEMENT" 
                      className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-secondary outline-none uppercase font-body"
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyPromo} 
                      className="px-6 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary/80 transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoStatusMsg && (
                    <p className={`text-sm mt-2 font-body font-bold ${promoStatusMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                      {promoStatusMsg.text}
                    </p>
                  )}
                </div>

                <div className="pt-8 border-t border-border flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="text-primary/60 hover:text-primary transition font-medium px-4 py-3">Retour</button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* ÉTAPE 4 : STRIPE (Désormais totalement en dehors du <form> principal) */}
        {step === 4 && clientSecret && (
          <div className="p-8 md:p-12 rounded-[40px] bg-surface shadow-soft border border-primary/20">
            <h2 className="font-heading text-2xl mb-8 flex items-center text-primary">
              <span className={`font-body text-sm w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-primary text-white`}>4</span>
              Sécurisation Bancaire
            </h2>
            
            <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start">
              <Lock className="w-5 h-5 mr-3 text-primary mt-1 flex-shrink-0" />
              <p className="font-body text-sm text-primary/80 leading-relaxed">
                {paymentChoice === "full" 
                  ? "Vous êtes sur le point de régler l'intégralité de votre soin par carte bancaire. La transaction est sécurisée par Stripe." 
                  : `Aucun montant ne sera débité aujourd'hui. Cette empreinte garantit votre créneau. En cas d'annulation à moins de 24h, des frais de ${penaltyAmount}€ (20%) seront appliqués.`}
              </p>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <StripeCheckout onSuccess={finalizeBooking} type={clientSecretType} />
            </Elements>

            <button type="button" onClick={() => setStep(3)} className="mt-8 text-primary/60 hover:text-primary transition font-body font-medium">
              Retour au formulaire
            </button>
          </div>
        )}
      </div>

      {/* Colonne Droite : Le Récapitulatif Fixe ... */}

      <div className="lg:col-span-1">
        <div className="bg-primary text-[#FAFAF7] p-10 rounded-[40px] shadow-xl sticky top-32">
          <h3 className="font-heading text-2xl mb-8 pb-6 border-b border-[#FAFAF7]/20 uppercase tracking-widest text-center">Récapitulatif</h3>
          
          <div className="space-y-6 font-heading text-lg text-[#FAFAF7]/90 mb-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-secondary mb-1">Rituel</p>
              <p className="font-bold">
                {selectedService ? (isCure ? selectedService.cureName : selectedService.name) : "À finir"}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-secondary mb-1">Date</p>
              <p className="font-bold">{watchStartsAt ? format(new Date(watchStartsAt), "d MMMM yyyy 'à' HH:mm", { locale: fr }) : "À définir"}</p>
            </div>
          </div>

          {/*<div className="pt-6 border-t border-[#FAFAF7]/20">
            <p className="text-sm uppercase tracking-widest text-secondary mb-3">Code Promo / Parrain</p>
            <div className="flex gap-2">
              <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Ex: LANCEMENT" className="w-full p-3 border border-white/20 rounded-xl bg-white/5 focus:border-secondary outline-none text-white font-body text-sm placeholder-white/30 uppercase"/>
              <button type="button" onClick={handleApplyPromo} className="px-4 bg-secondary text-primary font-bold rounded-xl hover:bg-white transition-colors text-sm">OK</button>
            </div>
            {promoStatusMsg && <p className={`text-xs mt-2 font-body font-bold ${promoStatusMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{promoStatusMsg.text}</p>}
          </div>
          */}
          <div className="mt-8 pt-6 border-t border-[#FAFAF7]/20 flex justify-between items-end">
            <span className="font-heading text-xl uppercase tracking-widest">Total</span>
            <div className="text-right">
              {appliedPromo?.discount && selectedService?.price ? (
                <>
                  <span className="text-lg text-white/50 line-through mr-2">{selectedService.price} €</span>
                  <span className="font-heading text-3xl font-bold text-secondary">{finalPrice} €</span>
                </>
              ) : (
                <span className="font-heading text-3xl font-bold">{selectedService?.price ? `${selectedService.price} €` : "--"}</span>
              )}
            </div>
          </div>

          {step === 3 && selectedService && (
            <div className="mt-8 pt-6 border-t border-[#FAFAF7]/20">
              <p className="text-sm uppercase tracking-widest text-secondary mb-4">Mode de règlement</p>
              
              <div className="space-y-3 font-body text-sm">
                <label className={`flex items-start p-4 rounded-xl cursor-pointer transition-all border ${paymentChoice === 'full' ? 'bg-secondary/10 border-secondary text-white' : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'}`}>
                  <input type="radio" name="payment" value="full" checked={paymentChoice === "full"} onChange={() => setPaymentChoice("full")} className="mt-1 mr-3" />
                  <div>
                    <span className="font-bold flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Payer en ligne (Carte)</span>
                    <span className="text-xs opacity-70 mt-1 block">Réglez l'intégralité du soin dès maintenant.</span>
                  </div>
                </label>

                <label className={`flex items-start p-4 rounded-xl cursor-pointer transition-all border ${paymentChoice === 'hold' ? 'bg-secondary/10 border-secondary text-white' : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'}`}>
                  <input type="radio" name="payment" value="hold" checked={paymentChoice === "hold"} onChange={() => setPaymentChoice("hold")} className="mt-1 mr-3" />
                  <div>
                    <span className="font-bold flex items-center"><Banknote className="w-4 h-4 mr-2" /> Payer sur place (Espèces)</span>
                    <span className="text-xs opacity-70 mt-1 block">Empreinte requise. Le paiement final se fera <strong>exclusivement en espèces</strong>.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 p-4 border border-red-400/50 rounded-xl flex items-start text-sm text-red-200">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> <p>{errorMsg}</p>
            </div>
          )}

          {/* 3. Le bouton utilise maintenant onClick pour appeler la validation du formulaire (suppression du submit classique de formulaire parent) */}
          {step !== 4 && (
            <button 
              type="button" 
              onClick={form.handleSubmit(handleProceedToPayment)} 
              disabled={step !== 3 || isSubmitting} 
              className={`w-full mt-10 py-5 rounded-full font-body font-bold tracking-wide uppercase transition-all duration-300 flex justify-center items-center ${step === 3 && !isSubmitting ? 'bg-secondary text-primary hover:bg-[#FAFAF7] hover:scale-[1.02]' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sécurisation...</> : "Continuer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}