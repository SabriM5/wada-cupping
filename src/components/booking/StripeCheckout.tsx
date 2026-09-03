"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle } from "lucide-react";

export default function StripeCheckout({ onSuccess, type }: { onSuccess: () => void, type: "payment" | "setup" }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    // L'URL de retour inclut explicitement le paramètre de succès
    const returnUrl = `${window.location.origin}/reservation?success=true`;

    const { error: submitError } = type === "payment"
      ? await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl }, redirect: "if_required" })
      : await stripe.confirmSetup({ elements, confirmParams: { return_url: returnUrl }, redirect: "if_required" });

    if (submitError) {
      setError(submitError.message || "La transaction a échoué. Veuillez vérifier votre carte.");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-6" />
      
      {error && (
        <div className="p-4 border border-red-400/50 rounded-xl flex items-start text-sm text-red-600 bg-red-50">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full py-4 rounded-full font-body font-bold tracking-wide uppercase bg-secondary text-primary hover:bg-[#FAFAF7] transition-all flex justify-center items-center"
      >
        {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Traitement...</> : type === "payment" ? "Payer maintenant" : "Valider mon empreinte"}
      </button>
    </form>
  );
}