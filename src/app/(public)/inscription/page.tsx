import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Créer mon espace | WADA",
  description: "Rejoignez le programme de fidélité WADA.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-primary font-bold mb-4">Première Connexion</h1>
          <p className="font-body text-primary/60">Activez votre espace privilège pour accéder à votre fidélité.</p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
}