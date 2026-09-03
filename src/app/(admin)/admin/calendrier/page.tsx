import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import CancelPenaltyButton from "@/components/admin/CancelPenaltyButton";
import { sendCancellation } from "@/lib/mailer";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});

async function updateAppointmentStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as "CONFIRMED" | "CANCELLED" | "COMPLETED";
  
  const updatedAppt = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { service: true, user: { include: { customerProfile: true } } }
  });

  if (status === "CANCELLED" && updatedAppt.user?.email) {
    const profile = updatedAppt.user.customerProfile;
    const emailData = { clientEmail: updatedAppt.user.email, clientName: profile?.firstName || "Client" };
    await sendCancellation(emailData, updatedAppt.service, "ADMIN");
  }

  revalidatePath("/admin/calendrier");
}

async function cancelAndChargePenalty(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  let warningMessage = "";

  // On lit les paramètres en temps réel
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  const penaltyPercent = settings?.cancellationPenaltyPercent || 20;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, user: { include: { customerProfile: true } } }
  });

  if (appointment && appointment.user?.email) {
    try {
      const customers = await stripe.customers.list({ email: appointment.user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        const paymentMethods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card' });

        if (paymentMethods.data.length > 0) {
          // On applique le vrai pourcentage défini par l'Admin
          const penaltyAmount = Math.round(appointment.service.price * (penaltyPercent / 100) * 100);
          await stripe.paymentIntents.create({
            amount: penaltyAmount,
            currency: "eur",
            customer: customer.id,
            payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
            description: `Pénalité d'annulation tardive (${penaltyPercent}%) - ${appointment.service.name}`,
          });
        } else {
           warningMessage = "Aucune carte bancaire trouvée pour cette cliente.";
        }
      } else {
         warningMessage = "Cliente introuvable sur Stripe.";
      }
    } catch (error: any) {
      console.error("Erreur de prélèvement Stripe :", error);
      warningMessage = error.message || "Le prélèvement a été refusé par la banque.";
    }

    await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
    
    const profile = appointment.user.customerProfile;
    const emailData = { clientEmail: appointment.user.email, clientName: profile?.firstName || "Client" };
    await sendCancellation(emailData, appointment.service, "ADMIN");
  }
  
  if (warningMessage) {
    redirect(`/admin/calendrier?warning=${encodeURIComponent(warningMessage)}`);
  }
  
  revalidatePath("/admin/calendrier");
  redirect("/admin/calendrier?success=1");
}

export default async function CalendarPage({ searchParams }: any) {
  const appointments = await prisma.appointment.findMany({
    orderBy: { startsAt: 'desc' },
    include: { service: true, user: { include: { customerProfile: true } } },
  });

  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  const penaltyPercent = settings?.cancellationPenaltyPercent || 20;

  const warning = searchParams?.warning;
  const success = searchParams?.success;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Planning & Rendez-vous</h1>
          <p className="font-body text-primary/60 text-lg">Gérez vos séances et l'historique de vos interventions.</p>
        </div>
      </div>

      {warning && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-600 rounded-[20px] flex items-start animate-fade-in-up">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Rendez-vous annulé, mais le prélèvement a échoué.</h3>
            <p className="mt-1 text-red-600/80">{warning}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Rendez-vous annulé et pénalité de 20% prélevée avec succès.</h3>
        </div>
      )}

      <div className="space-y-6">
        {appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-[30px] border border-primary/10 text-center">
            <Clock className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="font-heading text-xl text-primary/60">Aucun rendez-vous pour le moment.</p>
          </div>
        ) : (
          appointments.map((appt) => {
            const isConfirmed = appt.status === "CONFIRMED";
            const isCancelled = appt.status === "CANCELLED";
            
            return (
              <div key={appt.id} className={`bg-white p-8 rounded-[30px] border transition-all ${isCancelled ? 'border-border opacity-60' : 'border-primary/10 shadow-sm hover:shadow-md'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
                    <p className="font-body text-sm text-primary/60 uppercase tracking-widest mb-1">
                      {format(new Date(appt.startsAt), "EEEE d MMM", { locale: fr })}
                    </p>
                    <p className="font-heading text-4xl font-bold text-primary">
                      {format(new Date(appt.startsAt), "HH:mm")}
                    </p>
                    <div className="mt-4 inline-block px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 text-xs font-bold text-primary uppercase tracking-wider">
                      {appt.status}
                    </div>
                  </div>

                  <div className="flex-grow space-y-3">
                    <h3 className="font-heading text-2xl font-bold text-primary">
                      {appt.user?.customerProfile?.firstName || "Client"} {appt.user?.customerProfile?.lastName || ""}
                    </h3>
                    <p className="font-heading text-secondary text-lg">{appt.service.name}</p>
                    
                    <div className="pt-3 space-y-2 font-body text-sm text-primary/70">
                      <p className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-primary/40" /> {appt.snapshotAddress}</p>
                      <p className="flex items-center"><Phone className="w-4 h-4 mr-3 text-primary/40" /> {appt.snapshotPhone || "Non renseigné"}</p>
                      <p className="flex items-center"><Mail className="w-4 h-4 mr-3 text-primary/40" /> {appt.user?.email || "Email inconnu"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 border-border pt-4 md:pt-0 min-w-[220px]">
                    
                    {!isConfirmed && !isCancelled && (
                      <form action={updateAppointmentStatus}>
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="status" value="CONFIRMED" />
                        <button type="submit" className="w-full px-6 py-3 bg-primary text-[#FAFAF7] rounded-xl font-body font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Valider
                        </button>
                      </form>
                    )}
                    
                    {!isCancelled && (
                      <>
                        <form action={updateAppointmentStatus}>
                          <input type="hidden" name="id" value={appt.id} />
                          <input type="hidden" name="status" value="CANCELLED" />
                          <button type="submit" className="w-full px-6 py-3 bg-white border border-border text-primary rounded-xl font-body font-bold text-[11px] uppercase tracking-wider hover:bg-primary/5 transition flex items-center justify-center">
                            <XCircle className="w-4 h-4 mr-2" /> Annuler (Sans frais)
                          </button>
                        </form>

                        <form action={cancelAndChargePenalty}>
                          <input type="hidden" name="id" value={appt.id} />
                          <CancelPenaltyButton penaltyPercent={penaltyPercent} /> 
                        </form>
                      </>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}