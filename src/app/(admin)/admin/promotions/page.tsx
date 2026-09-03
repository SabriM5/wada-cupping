import prisma from "@/lib/prisma";
import { createPromoCode, togglePromoStatus } from "../../actions/admin.actions";
import { Tag, Plus, Activity, PowerOff } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Promotions & Marketing</h1>
          <p className="font-body text-primary/60 text-lg">Créez des codes de réduction pour vos clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Colonne Gauche : Formulaire de création */}
        <div className="lg:col-span-1">
          <form action={createPromoCode} className="bg-primary p-8 rounded-[30px] shadow-xl text-[#FAFAF7] sticky top-10">
            <div className="flex items-center mb-8 border-b border-white/10 pb-4">
              <Plus className="w-6 h-6 mr-3 text-secondary" />
              <h2 className="text-2xl font-heading font-bold">Nouveau Code</h2>
            </div>
            
            <div className="space-y-6 font-body">
              <div>
                <label className="block text-sm text-white/80 mb-2 uppercase tracking-widest">Code (Ex: BIENVENUE)</label>
                <input 
                  type="text" 
                  name="code"
                  required
                  className="w-full p-4 border border-white/20 rounded-xl bg-white/5 focus:border-secondary outline-none text-white uppercase" 
                />
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2 uppercase tracking-widest">Réduction (%)</label>
                <input 
                  type="number" 
                  name="discountPercent"
                  min="1"
                  max="100"
                  required
                  className="w-full p-4 border border-white/20 rounded-xl bg-white/5 focus:border-secondary outline-none text-white" 
                  placeholder="Ex: 20"
                />
              </div>

              <button type="submit" className="w-full mt-6 py-4 rounded-full font-body font-bold tracking-wide uppercase bg-secondary text-primary hover:bg-[#FAFAF7] transition-all">
                Générer le code
              </button>
            </div>
          </form>
        </div>

        {/* Colonne Droite : Liste des codes existants */}
        <div className="lg:col-span-2 space-y-6">
          {promos.length === 0 ? (
            <div className="bg-white p-12 rounded-[30px] border border-primary/10 text-center">
              <Tag className="w-12 h-12 text-primary/20 mx-auto mb-4" />
              <p className="font-heading text-xl text-primary/60">Aucun code promotionnel actif.</p>
            </div>
          ) : (
            promos.map((promo: any) => (
              <div key={promo.id} className={`p-6 rounded-[24px] border flex justify-between items-center transition-all ${promo.isActive ? 'bg-white border-primary/10 shadow-sm' : 'bg-transparent border-border opacity-60'}`}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 ${promo.isActive ? 'bg-secondary/20 text-secondary' : 'bg-border text-muted'}`}>
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-primary">{promo.code}</h3>
                    <p className="font-body text-primary/60 text-sm font-bold tracking-widest uppercase mt-1">Réduction : -{promo.discountPercent}%</p>
                  </div>
                </div>

                {/* Bouton d'activation/désactivation (Action Serveur intégrée) */}
                <form action={async () => {
                  "use server";
                  await togglePromoStatus(promo.id, promo.isActive);
                }}>
                  <button type="submit" className={`px-6 py-3 rounded-full font-body text-sm font-bold uppercase tracking-wider flex items-center transition-colors ${promo.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {promo.isActive ? <><PowerOff className="w-4 h-4 mr-2" /> Désactiver</> : <><Activity className="w-4 h-4 mr-2" /> Activer</>}
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}