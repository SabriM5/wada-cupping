"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Identifiants incorrects. Veuillez vérifier votre e-mail et mot de passe.");
        setIsLoading(false);
      } else {
        window.location.href = "/espace-client"; 
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur de communication avec le serveur est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 md:p-12 rounded-[40px] shadow-xl border border-primary/10 w-full">
      <div className="space-y-6 font-body">
        
        {/* Champ Email */}
        <div>
          <label className="block text-sm text-primary/80 mb-2 uppercase tracking-widest">Adresse E-mail</label>
          <input 
            type="email" 
            name="email"
            required
            className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none transition-colors" 
            placeholder="contact@exemple.com" 
          />
        </div>

        {/* Champ Mot de passe */}
        <div>
          <label className="block text-sm text-primary/80 mb-2 uppercase tracking-widest">Mot de passe</label>
          <input 
            type="password" 
            name="password"
            required
            className="w-full p-4 border border-border rounded-xl bg-transparent focus:border-primary outline-none transition-colors" 
            placeholder="••••••••" 
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-4 border border-red-400/50 rounded-xl flex items-start text-sm text-red-600 bg-red-50">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Bouton de validation */}
        <div className="pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 rounded-full font-body font-bold tracking-wide uppercase transition-all duration-300 flex justify-center items-center ${
              !isLoading 
                ? 'bg-primary text-[#FAFAF7] hover:bg-primary/90 hover:scale-[1.02]' 
                : 'bg-primary/50 text-white cursor-not-allowed'
            }`}
          >
            {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connexion...</> : "Se connecter"}
          </button>
        </div>
            {/* LIEN VERS L'INSCRIPTION */}
        <p className="text-center text-sm text-primary/60 mt-8">
          Pas encore de mot de passe ? <br />
          <Link href="/inscription" className="text-secondary font-bold hover:underline mt-2 inline-block">
            Créer mon espace privilège
          </Link>
        </p>
      </div>
    </form>
  );
}