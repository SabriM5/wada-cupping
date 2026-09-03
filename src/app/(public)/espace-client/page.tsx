import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Award, Gift, Calendar as CalIcon, Tag, Copy } from "lucide-react";
import ClientCancelButton from "@/components/client/ClientCancelButton";
import { revalidatePath } from "next/cache";
import { sendCancellation } from "@/lib/mailer";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import Stripe from "stripe";

// Initialisation de Stripe côté serveur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});

export default async function ClientDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/connexion");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/calendrier");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customerProfile: true,
      appointments: {
        orderBy: { startsAt: 'desc' },
        include: { service: true }
      }
    }
  });

  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  const promos = await prisma.promoCode.findMany({ where: { isActive: true } });
  
  const profile = user?.customerProfile;
  if (!profile) return <div className="pt-40 text-center">Profil introuvable.</div>;

  const progress = Math.min((profile.visitsCount / (settings?.loyaltyVisitsRequired || 5)) * 100, 100);

  return (
    <div className="min-h-screen bg-background pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <div className="mb-12 border-b border-primary/10 pb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-primary font-bold mb-2">
            Bonjour {profile.firstName},
          </h1>
          <p className="font-body text-primary/60 text-lg">Bienvenue dans votre espace privilège WADA.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Carte 1 : Fidélité */}
          <div className="bg-white p-8 rounded-[30px] border border-primary/10 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Award className="w-24 h-24" /></div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6 flex items-center relative z-10">
              <Award className="w-6 h-6 mr-3 text-secondary" /> Votre Fidélité
            </h2>
            <div className="mb-4 flex justify-between font-body text-sm font-bold text-primary/70 relative z-10">
              <span>{profile.visitsCount} Soin(s)</span>
              <span>Objectif : {settings?.loyaltyVisitsRequired}</span>
            </div>
            <div className="w-full bg-primary/5 rounded-full h-3 mb-4 relative z-10">
              <div className="bg-secondary h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="relative z-10 mt-auto">
              {progress >= 100 ? (
                <div className="mt-4 animate-fade-in-up">
                  <p className="text-xs text-secondary mb-2 uppercase tracking-widest font-bold text-center">Félicitations !</p>
                  <p className="font-body text-sm text-primary/80 mb-3 text-center">Utilisez ce code lors de votre réservation :</p>
                  
                  {/* Le code avec le même style que le parrainage et le bouton copier */}
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                    <span className="font-heading text-xl font-bold tracking-widest text-primary">
                      FIDELITE
                    </span>
                    <CopyToClipboard text="FIDELITE" className="text-primary/40 hover:text-primary" />
                  </div>
                </div>
              ) : (
                <p className="font-body text-sm text-primary/60 italic">
                  Plus que {settings?.loyaltyVisitsRequired! - profile.visitsCount} soin(s) pour débloquer : <strong>{settings?.loyaltyRewardDesc}</strong>.
                </p>
              )}
            </div>
          </div>

          {/* Carte 2 : Parrainage (CORRIGÉE) */}
          <div className="bg-white p-8 rounded-[30px] border border-primary/10 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Gift className="w-24 h-24" /></div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4 flex items-center relative z-10">
              <Gift className="w-6 h-6 mr-3 text-secondary" /> Parrainage
            </h2>
            <p className="font-body text-sm text-primary/60 mb-6 relative z-10 leading-relaxed">
              Offrez <strong>{settings?.referralRewardReferred}</strong> à un proche et recevez <strong>{settings?.referralRewardReferrer}</strong> en retour grâce à votre code personnel.
            </p>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center relative z-10 mt-auto">
              <span className="font-heading text-xl font-bold tracking-widest text-primary">
                {profile.referralCode.substring(0, 8).toUpperCase()}
              </span>
              <CopyToClipboard text={profile.referralCode.substring(0, 8).toUpperCase()} className="text-primary/40 hover:text-primary" />
            </div>
          </div>

          {/* Carte 3 : Promotions Actives (CORRIGÉE) */}
          <div className="bg-white p-8 rounded-[30px] border border-primary/10 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Tag className="w-24 h-24" /></div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6 flex items-center relative z-10">
              <Tag className="w-6 h-6 mr-3 text-secondary" /> Offres du moment
            </h2>
            
            <div className="space-y-3 relative z-10 overflow-y-auto pr-2 mt-auto">
              {promos.length === 0 ? (
                <p className="font-body text-sm text-primary/60 italic text-center py-4">Aucune offre en cours.</p>
              ) : (
                promos.map(promo => (
                  <div key={promo.id} className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-primary tracking-widest">{promo.code}</span>
                      <CopyToClipboard text={promo.code} className="text-primary/40 hover:text-primary" />
                    </div>
                    <span className="font-body font-bold text-secondary text-sm">-{promo.discountPercent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
        
        {/* Historique des rendez-vous */}
        <h2 className="font-heading text-3xl font-bold text-primary mb-8 border-b border-primary/10 pb-4">Vos Rituels</h2>
        
        {user.appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[30px] border border-primary/10">
            <CalIcon className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="font-body text-primary/60">Vous n'avez pas encore réservé de soin.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[30px] border border-primary/10 shadow-sm overflow-hidden">
            {user.appointments.map((appt, idx) => {
              const startsAtDate = new Date(appt.startsAt);
              const now = new Date();
              const isUpcoming = startsAtDate > now;
              const canCancel = isUpcoming && appt.status === "CONFIRMED";

              // Lecture des règles dynamiques
              const cancelHours = settings?.cancellationNoticeHours || 24;
              const cancelPenalty = settings?.cancellationPenaltyPercent || 20;

              // Calcul du délai restant
              const hoursDifference = (startsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60);
              const isWithinDeadline = hoursDifference < cancelHours;

              // Message de Pop-up intelligent
              const cancelMessage = isWithinDeadline
                ? `⚠️ ATTENTION : Vous annulez à moins de ${cancelHours}h du soin.\n\nConformément aux CGV, une pénalité de ${cancelPenalty}% sera appliquée (retenue sur votre paiement initial ou prélevée sur votre carte de garantie).\n\nConfirmer l'annulation ?`
                : `Êtes-vous sûr de vouloir annuler ce rituel ?\n\nVous annulez à plus de ${cancelHours}h : aucun frais ne sera appliqué. Si vous aviez réglé en ligne, vous serez intégralement remboursé.\n\nConfirmer l'annulation ?`;

              return (
                <div key={appt.id} className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center ${idx !== user.appointments.length - 1 ? 'border-b border-border' : ''}`}>
                  <div>
                    <p className="font-body text-sm text-primary/60 uppercase tracking-widest mb-1">
                      {format(startsAtDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                    <p className="font-heading text-xl font-bold text-primary">{appt.service.name}</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : appt.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'}`}>
                      {appt.status}
                    </span>
                    
                    {canCancel && (
                      <form action={async (formData) => {
                        "use server";
                        const id = formData.get("id") as string;
                        
                        const apptToCancel = await prisma.appointment.findUnique({
                          where: { id },
                          include: { service: true, user: { include: { customerProfile: true } } }
                        });

                        if (apptToCancel && apptToCancel.user?.email) {
                          const currentSettings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
                          const penaltyPct = currentSettings?.cancellationPenaltyPercent || 20;
                          const noticeHrs = currentSettings?.cancellationNoticeHours || 24;

                          const cancelTime = new Date();
                          const apptTime = new Date(apptToCancel.startsAt);
                          const diffHrs = (apptTime.getTime() - cancelTime.getTime()) / (1000 * 60 * 60);

                          // Débit dynamique Stripe
                          if (diffHrs < noticeHrs) {
                            try {
                              const customers = await stripe.customers.list({ email: apptToCancel.user.email, limit: 1 });
                              if (customers.data.length > 0) {
                                const customer = customers.data[0];
                                const paymentMethods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card' });
                                
                                if (paymentMethods.data.length > 0) {
                                  const penaltyAmount = Math.round(apptToCancel.service.price * (penaltyPct / 100) * 100);
                                  await stripe.paymentIntents.create({
                                    amount: penaltyAmount,
                                    currency: "eur",
                                    customer: customer.id,
                                    payment_method: paymentMethods.data[0].id,
                                    off_session: true,
                                    confirm: true,
                                    description: `Pénalité annulation Client (<${noticeHrs}h) - ${apptToCancel.service.name}`,
                                  });
                                }
                              }
                            } catch (error) {
                              console.error("Erreur prélèvement Stripe (Client) :", error);
                            }
                          }

                          const canceledAppt = await prisma.appointment.update({
                            where: { id },
                            data: { status: "CANCELLED" },
                            include: { service: true, user: { include: { customerProfile: true } } }
                          });
                          
                          if (canceledAppt.user?.email) {
                            await sendCancellation(
                              { clientEmail: canceledAppt.user.email, clientName: canceledAppt.user.customerProfile?.firstName || "Client" }, 
                              canceledAppt.service, 
                              "CLIENT"
                            );
                          }
                        }

                        revalidatePath("/espace-client");
                      }}>
                        <input type="hidden" name="id" value={appt.id} />
                        <ClientCancelButton message={cancelMessage} />
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}