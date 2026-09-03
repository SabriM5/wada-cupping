import { Calendar as CalendarIcon, TrendingUp, Users, Tag, Award } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Empêche la mise en cache pour toujours avoir les données en direct
export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Récupération des 10 prochains RDV
  const upcomingAppointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: today }, status: { not: "CANCELLED" } },
    orderBy: { startsAt: 'asc' },
    include: { service: true, user: { include: { customerProfile: true } } },
    take: 10
  });

  // 2. Calcul du nombre réel de clients (ayant un profil complété)
  const totalClients = await prisma.user.count({
    where: { 
      role: "CUSTOMER",
      customerProfile: { isNot: null } 
    }
  });

  // 3. Récupération des codes promo actifs
  const activePromos = await prisma.promoCode.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const topPromo = activePromos.length > 0 ? activePromos[0].code : "Aucun code actif";

  // Calcul du CA prévisionnel (basé sur le prix de base pour le moment)
  const estimatedRevenue = upcomingAppointments.reduce((sum, appt) => sum + appt.service.price, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Bonjour Amira,</h1>
          <p className="font-body text-primary/60 text-lg">Voici l'état de votre activité aujourd'hui.</p>
        </div>
      </div>

      {/* KPIs (Indicateurs clés dynamiques) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="RDV à venir" value={upcomingAppointments.length.toString()} icon={CalendarIcon} />
        <StatCard title="CA Prévisionnel" value={`${estimatedRevenue} €`} icon={TrendingUp} />
        <StatCard title="Clients Base" value={totalClients.toString()} icon={Users} />
        <StatCard title="Codes Promo Actifs" value={activePromos.length.toString()} icon={Tag} subtitle={topPromo} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Liste des vrais RDV */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[30px] shadow-sm border border-primary/10">
          <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
            <h2 className="text-2xl font-heading font-bold text-primary">Vos prochains rendez-vous</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-primary/50 font-body italic text-center py-10">Aucun rendez-vous de prévu pour le moment.</p>
            ) : (
              upcomingAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center p-5 rounded-2xl border border-border hover:border-secondary transition-colors group">
                  <div className="w-32 flex-shrink-0 border-r border-border mr-4">
                    <p className="font-bold text-primary">{format(new Date(appt.startsAt), "HH:mm")}</p>
                    <p className="text-xs text-primary/60 uppercase">{format(new Date(appt.startsAt), "dd MMM", { locale: fr })}</p>
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-primary text-lg">
                      {appt.user?.customerProfile?.firstName || "Client"} {appt.user?.customerProfile?.lastName || ""}
                    </p>
                    <p className="text-sm text-primary/70">{appt.service.name}</p>
                    <p className="text-xs text-primary/50 mt-1">📍 {appt.snapshotAddress}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-4 py-2 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider rounded-full">
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bloc Raccourcis Marketing */}
        <div className="bg-primary p-8 rounded-[30px] shadow-xl text-[#FAFAF7]">
          <h2 className="text-2xl font-heading font-bold mb-8">Croissance</h2>
          
          <div className="space-y-6">
            <a href="/admin/promotions" className="block bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition cursor-pointer">
              <Tag className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Créer une promotion</h3>
              <p className="text-sm text-white/60 font-body">Gérez un code (ex: LANCEMENT) à partager sur Instagram.</p>
            </a>

            <a href="/admin/parametres" className="block bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition cursor-pointer">
              <Award className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Programme Fidélité</h3>
              <p className="text-sm text-white/60 font-body">Configurez les récompenses (ex: 5ème soin à -50%).</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// Composant Carte Statistique
function StatCard({ title, value, icon: Icon, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-primary/10 flex items-start justify-between group hover:shadow-md transition">
      <div>
        <p className="text-sm text-primary/60 font-body uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-heading font-bold text-primary">{value}</p>
        {subtitle && <p className="text-xs text-secondary mt-2 font-medium">{subtitle}</p>}
      </div>
      <div className="p-4 bg-primary/5 rounded-2xl group-hover:bg-secondary/10 transition">
        <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition" />
      </div>
    </div>
  );
}