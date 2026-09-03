"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerCustomer } from "@/actions/auth.actions";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await registerCustomer(formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000); // Redirection vers connexion après 2s
    }
  };

  if (success) {
    return (
      <div className="bg-white p-10 rounded-[40px] shadow-xl border border-primary/10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="font-heading text-2xl text-primary font-bold mb-2">Compte activé !</h2>
        <p className="font-body text-primary/70">Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-xl border border-primary/10">
      <div className="space-y-6 font-body">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary/80 mb-2 uppercase tracking-widest">Prénom</label>
            <input type="text" name="firstName" required className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/80 mb-2 uppercase tracking-widest">Nom</label>
            <input type="text" name="lastName" required className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary/80 mb-2 uppercase tracking-widest">Adresse E-mail</label>
          <input type="email" name="email" required className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" placeholder="contact@exemple.com" />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary/80 mb-2 uppercase tracking-widest">Mot de passe</label>
          <input type="password" name="password" minLength={8} required className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none" placeholder="Minimum 8 caractères" />
        </div>

        {error && (
          <div className="p-4 border border-red-400/50 rounded-xl flex items-start text-sm text-red-600 bg-red-50">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> <p>{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="w-full py-4 rounded-full font-body font-bold tracking-wide uppercase transition-all flex justify-center items-center bg-primary text-[#FAFAF7] hover:bg-primary/90">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activer mon espace"}
          </button>
        </div>

        <p className="text-center text-sm text-primary/60 mt-6">
          Déjà un compte ? <Link href="/connexion" className="text-secondary font-bold hover:underline">Se connecter</Link>
        </p>
      </div>
    </form>
  );
}