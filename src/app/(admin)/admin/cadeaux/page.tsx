import prisma from "@/lib/prisma";
import { Gift, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function GiftCardsAdminPage() {
  // Maintenant que la relation Prisma existe, ceci va fonctionner parfaitement !
  const giftCards = await prisma.giftCard.findMany({
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });

  // Calcul des statistiques
  const totalRevenue = giftCards.reduce((acc, card) => acc + (card.service?.price || 0), 0);
  const usedCardsCount = giftCards.filter(c => c.isUsed).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Bons Cadeaux</h1>
          <p className="font-body text-primary/60 text-lg">Gérez les ventes et l'utilisation de vos cartes cadeaux.</p>
        </div>
      </div>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-primary/10">
          <p className="text-sm text-primary/60 font-body uppercase tracking-wider mb-2">Chiffre d'Affaires</p>
          <p className="text-3xl font-heading font-bold text-primary">{totalRevenue} €</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-primary/10">
          <p className="text-sm text-primary/60 font-body uppercase tracking-wider mb-2">Cartes Vendues</p>
          <p className="text-3xl font-heading font-bold text-primary">{giftCards.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-primary/10">
          <p className="text-sm text-primary/60 font-body uppercase tracking-wider mb-2">Cartes Utilisées</p>
          <p className="text-3xl font-heading font-bold text-primary">{usedCardsCount}</p>
        </div>
      </div>

      {/* Liste des Bons Cadeaux */}
      <div className="bg-white rounded-[30px] border border-primary/10 shadow-sm overflow-hidden">
        {giftCards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="font-body text-primary/60">Aucun bon cadeau vendu pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body">
              <thead className="bg-[#FAFAF7] text-primary/60 text-xs uppercase tracking-widest border-b border-primary/10">
                <tr>
                  <th className="p-6 font-bold">Code</th>
                  <th className="p-6 font-bold">Acheteur</th>
                  <th className="p-6 font-bold">Bénéficiaire</th>
                  <th className="p-6 font-bold">Soin</th>
                  <th className="p-6 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {giftCards.map((card) => (
                  <tr key={card.id} className="hover:bg-[#FAFAF7]/50 transition-colors">
                    <td className="p-6 font-heading font-bold text-primary text-lg">{card.code}</td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-primary">{card.buyerEmail}</p>
                      <p className="text-xs text-primary/50">{format(new Date(card.createdAt), "dd/MM/yyyy")}</p>
                    </td>
                    <td className="p-6 text-sm font-bold text-primary">{card.recipientName || "-"}</td>
                    <td className="p-6">
                      <p className="text-sm text-primary">{card.service?.name}</p>
                      <p className="text-xs font-bold text-secondary">{card.service?.price} €</p>
                    </td>
                    <td className="p-6">
                      {card.isUsed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 mr-2" /> Utilisé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3 mr-2" /> Valide
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}