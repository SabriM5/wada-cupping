import prisma from "@/lib/prisma";
import { updateMarketingSettings, updateAdminCredentials } from "../../actions/admin.actions";
import { Users, Award, Save, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: any) {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  
  const success = searchParams?.success;
  const error = searchParams?.error;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Paramètres</h1>
        <p className="font-body text-primary/60 text-lg">Gérez vos accès de sécurité et vos règles commerciales.</p>
      </div>

      {/* Alertes Visuelles */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-[20px] flex items-start animate-fade-in-up">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
          <div><h3 className="font-bold text-lg">Mise à jour impossible</h3><p className="mt-1 text-red-600/80">{error}</p></div>
        </div>
      )}
      {success === "credentials" && (
        <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Vos identifiants de connexion ont été mis à jour avec succès.</h3>
        </div>
      )}
      {success === "marketing" && (
        <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Les règles commerciales ont été sauvegardées.</h3>
        </div>
      )}

      {/* --- BLOC 1 : SÉCURITÉ --- */}
      <form action={updateAdminCredentials} className="bg-white p-8 md:p-12 rounded-[30px] shadow-sm border border-primary/10">
        <h2 className="text-2xl font-heading font-bold text-primary mb-8 border-b border-border pb-4 flex items-center">
          <Lock className="w-6 h-6 mr-3 text-secondary" /> Identifiants de connexion
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body">
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Nouvel E-mail</label>
            <input type="email" name="email" placeholder="nouveau@email.com (Optionnel)" className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Nouveau Mot de passe</label>
            <input type="password" name="newPassword" minLength={8} placeholder="Minimum 8 caractères (Optionnel)" className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-border flex justify-end">
          <button type="submit" className="px-8 py-3 rounded-full font-body font-bold tracking-wide uppercase bg-primary text-[#FAFAF7] hover:bg-primary/90 transition-all">
            Mettre à jour les accès
          </button>
        </div>
      </form>

      {/* --- BLOC 2 : MARKETING --- */}
      <form action={updateMarketingSettings} className="bg-white p-8 md:p-12 rounded-[30px] shadow-sm border border-primary/10">
        <h2 className="text-2xl font-heading font-bold text-primary mb-8 border-b border-border pb-4 flex items-center">
          <Award className="w-6 h-6 mr-3 text-secondary" /> Programme de Fidélité
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body mb-12">
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Nombre de soins requis</label>
            <input type="number" name="loyaltyVisitsRequired" defaultValue={settings?.loyaltyVisitsRequired || 5} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Récompense Fidélité</label>
            <input type="text" name="loyaltyRewardDesc" defaultValue={settings?.loyaltyRewardDesc || "-50% sur la prochaine séance"} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
        </div>

        <h2 className="text-2xl font-heading font-bold text-primary mb-8 border-b border-border pb-4 flex items-center">
          <Users className="w-6 h-6 mr-3 text-secondary" /> Système de Parrainage
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body">
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Cadeau pour le Parrain</label>
            <input type="text" name="referralRewardReferrer" defaultValue={settings?.referralRewardReferrer || "10 € offerts sur le prochain soin"} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Cadeau pour le Filleul</label>
            <input type="text" name="referralRewardReferred" defaultValue={settings?.referralRewardReferred || "10 € de réduction immédiate"} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
          </div>
        </div>
        <h2 className="text-2xl font-heading font-bold text-primary mb-8 border-b border-border pb-4 flex items-center mt-12">
          <AlertCircle className="w-6 h-6 mr-3 text-secondary" /> Politique d'Annulation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body">
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Délai limite (en heures)</label>
            <input type="number" name="cancellationNoticeHours" defaultValue={settings?.cancellationNoticeHours || 24} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
            <p className="text-xs text-primary/50 mt-2">Délai avant le soin sous lequel une annulation est pénalisée.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-primary/80 mb-2 uppercase tracking-widest">Pénalité (en %)</label>
            <input type="number" name="cancellationPenaltyPercent" defaultValue={settings?.cancellationPenaltyPercent || 20} className="w-full p-4 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none" />
            <p className="text-xs text-primary/50 mt-2">Pourcentage du prix du soin prélevé en cas d'annulation tardive.</p>
          </div>
        </div>
        <div className="pt-10 mt-8 border-t border-border flex justify-end">
          <button type="submit" className="px-10 py-4 rounded-full font-body font-bold tracking-wide uppercase bg-primary text-[#FAFAF7] hover:bg-primary/90 transition-all flex items-center">
            <Save className="w-5 h-5 mr-3" /> Sauvegarder les règles
          </button>
        </div>
      </form>
    </div>
  );
}