import prisma from "@/lib/prisma";
import { format, addMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, MapPin, Phone, Mail, AlertCircle, CalendarClock, MessageCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import CancelPenaltyButton from "@/components/admin/CancelPenaltyButton";
import { sendCancellation, sendClientConfirmation } from "@/lib/mailer";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});

// Fonction utilitaire pour convertir la date et l'heure choisies par Amira sur le fuseau de Paris
function createParisDate(dateStr: string, timeStr: string) {
  const dateUTC = new Date(`${dateStr}T${timeStr}:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    hourCycle: 'h23'
  });
  const parts = formatter.formatToParts(new Date(`${dateStr}T12:00:00Z`));
  const parisHour = parseInt(parts.find(p => p.type === 'hour')?.value || "12");
  const offset = parisHour - 12;
  dateUTC.setUTCHours(dateUTC.getUTCHours() - offset);
  return dateUTC;
}

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
    const emailData = { clientEmail: updatedAppt.user.email, clientName: profile?.firstName || "Client", startsAt: updatedAppt.startsAt};
    await sendCancellation(emailData, updatedAppt.service, "ADMIN");
  }

  revalidatePath("/admin/calendrier");
}

// --- NOUVELLE ACTION : DÉPLACER / REPROGRAMMER UN RDV ---
async function rescheduleAppointment(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const newDate = formData.get("newDate") as string;
  const newTime = formData.get("newTime") as string;

  if (!id || !newDate || !newTime) return;

  const existingAppt = await prisma.appointment.findUnique({
    where: { id },
    include: { service: true, user: { include: { customerProfile: true } } }
  });

  if (!existingAppt) return;

  const newStartsAt = createParisDate(newDate, newTime);
  const newEndsAt = addMinutes(newStartsAt, existingAppt.service.durationMin);

  await prisma.appointment.update({
    where: { id },
    data: {
      startsAt: newStartsAt,
      endsAt: newEndsAt,
      status: "CONFIRMED"
    }
  });

  // On renvoie automatiquement un e-mail de confirmation avec le nouveau créneau à la cliente
  if (existingAppt.user?.email) {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
    const profile = existingAppt.user.customerProfile;
    await sendClientConfirmation({
      startsAt: newStartsAt.toISOString(),
      clientName: profile ? `${profile.firstName} ${profile.lastName}` : "Cliente",
      clientEmail: existingAppt.user.email,
      clientAddress: existingAppt.snapshotAddress,
      cancelHours: settings?.cancellationNoticeHours || 24,
      cancelPenalty: settings?.cancellationPenaltyPercent || 20
    }, existingAppt.service);
  }

  revalidatePath("/admin/calendrier");
  redirect("/admin/calendrier?rescheduled=1");
}

async function cancelAndChargePenalty(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  let warningMessage = "";

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
    const emailData = { clientEmail: appointment.user.email, clientName: profile?.firstName || "Client", startsAt: appointment.startsAt };
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
  const rescheduled = searchParams?.rescheduled;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Planning & Rendez-vous</h1>
          <p className="font-body text-primary/60 text-lg">Gérez vos séances, déplacez un créneau ou contactez vos clientes.</p>
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
          <h3 className="font-bold text-lg">Rendez-vous annulé et pénalité prélevée avec succès.</h3>
        </div>
      )}

      {rescheduled && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Le créneau a bien été modifié et un nouvel e-mail de confirmation a été envoyé à la cliente !</h3>
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
            const clientFullName = `${appt.user?.customerProfile?.firstName || "Cliente"} ${appt.user?.customerProfile?.lastName || ""}`.trim();
            
            // Préparation du lien WhatsApp rapide depuis l'interface Admin
            const cleanPhone = (appt.snapshotPhone || "").replace(/[\s.-]/g, "");
            const waPhone = cleanPhone.startsWith("0") ? `33${cleanPhone.substring(1)}` : cleanPhone.replace("+", "");
            const waMessage = encodeURIComponent(
              `Bonjour ${appt.user?.customerProfile?.firstName || ""}, je vous contacte concernant votre séance WADA (${appt.service.name}) prévue le ${format(new Date(appt.startsAt), "d MMMM à HH:mm", { locale: fr })}.`
            );
            
            return (
              <div key={appt.id} className={`bg-white p-6 md:p-8 rounded-[30px] border transition-all ${isCancelled ? 'border-border opacity-60' : 'border-primary/10 shadow-sm hover:shadow-md'}`}>
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Colonne 1 : Date & Heure */}
                  <div className="lg:w-48 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-6">
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

                  {/* Colonne 2 : Infos Cliente & Bouton de contact direct */}
                  <div className="flex-grow space-y-3">
                    <h3 className="font-heading text-2xl font-bold text-primary">
                      {clientFullName}
                    </h3>
                    <p className="font-heading text-secondary text-lg">
                      {appt.service.name} {appt.isCure && <span className="text-xs bg-secondary/20 text-primary px-2 py-1 rounded-full ml-2 font-body uppercase">Cure</span>}
                    </p>
                    
                    <div className="pt-2 space-y-2 font-body text-sm text-primary/70">
                      <p className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-primary/40 flex-shrink-0" /> {appt.snapshotAddress}</p>
                      <p className="flex items-center"><Phone className="w-4 h-4 mr-3 text-primary/40 flex-shrink-0" /> {appt.snapshotPhone || "Non renseigné"}</p>
                      <p className="flex items-center"><Mail className="w-4 h-4 mr-3 text-primary/40 flex-shrink-0" /> {appt.user?.email || "Email inconnu"}</p>
                    </div>

                    {/* Bouton pour discuter directement avec la cliente */}
                    {!isCancelled && waPhone && (
                      <div className="pt-3 flex flex-wrap gap-2">
                        <a 
                          href={`https://wa.me/${waPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" /> Discuter sur WhatsApp
                        </a>
                        <a 
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl font-body text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition"
                        >
                          <Phone className="w-4 h-4 mr-2" /> Appeler
                        </a>
                      </div>
                    )}

                    {/* MODULE POUR DÉPLACER LE CRÉNEAU EN 1 CLIC */}
                    {!isCancelled && (
                      <form action={rescheduleAppointment} className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 bg-[#FAFAF7] p-4 rounded-2xl">
                        <input type="hidden" name="id" value={appt.id} />
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                            Nouvelle date
                          </label>
                          <input 
                            type="date" 
                            name="newDate" 
                            defaultValue={format(new Date(appt.startsAt), "yyyy-MM-dd")}
                            required
                            className="w-full p-2.5 text-sm border border-border rounded-xl bg-white text-primary font-body outline-none focus:border-primary"
                          />
                        </div>
                        <div className="sm:w-32">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                            Nouvelle heure
                          </label>
                          <input 
                            type="time" 
                            name="newTime" 
                            defaultValue={format(new Date(appt.startsAt), "HH:mm")}
                            required
                            className="w-full p-2.5 text-sm border border-border rounded-xl bg-white text-primary font-body outline-none focus:border-primary"
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="px-4 py-2.5 bg-secondary text-primary rounded-xl font-body font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-white transition flex items-center justify-center whitespace-nowrap"
                        >
                          <CalendarClock className="w-4 h-4 mr-2" /> Déplacer & Notifier
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Colonne 3 : Actions de Statut / Annulation */}
                  <div className="flex flex-col gap-3 justify-center border-t lg:border-t-0 border-border pt-4 lg:pt-0 min-w-[220px]">
                    
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