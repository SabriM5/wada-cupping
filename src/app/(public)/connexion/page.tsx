import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion | WADA",
  description: "Espace privé WADA.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden">
      
      {/* Cercles décoratifs en arrière-plan pour l'élégance */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl text-primary font-black tracking-[0.25em] mb-4">
            WADA
          </h1>
          <p className="font-heading italic text-primary/70 text-xl">
            Accès au tableau de bord
          </p>
        </div>
        
        <LoginForm />
        
      </div>
    </div>
  );
}