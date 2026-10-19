import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Clock, Save, AlertCircle, CheckCircle2, CalendarOff, Plus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

const DAYS_OF_WEEK = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// Fonction pour garantir l'heure de Paris
function createParisDate(dateStr: string, timeStr: string) {
  const dateUTC = new Date(`${dateStr}T${timeStr}:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', hour: 'numeric', hourCycle: 'h23' });
  const parts = formatter.formatToParts(new Date(`${dateStr}T12:00:00Z`));
  const parisHour = parseInt(parts.find(p => p.type === 'hour')?.value || "12");
  const offset = parisHour - 12;
  dateUTC.setUTCHours(dateUTC.getUTCHours() - offset);
  return dateUTC;
}

// --- ACTIONS SERVEURS ---
async function updateAvailability(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const id = formData.get("id") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (startTime >= endTime) {
    redirect(`/admin/disponibilites?error=${encodeURIComponent("L'heure de fin doit être postérieure.")}`);
  }

  await prisma.availability.update({ where: { id }, data: { startTime, endTime } });
  revalidatePath("/admin/disponibilites");
  redirect("/admin/disponibilites?success=1");
}

async function addAbsence(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const reason = formData.get("reason") as string || "Absence / Congés";

  if (!date || !startTime || !endTime) redirect("/admin/disponibilites?error=Champs manquants");
  if (startTime >= endTime) redirect("/admin/disponibilites?error=Heure de fin invalide");

  const startsAt = createParisDate(date, startTime);
  const endsAt = createParisDate(date, endTime);

  const practitioner = await prisma.practitioner.findFirst();
  if (!practitioner) redirect("/admin/disponibilites?error=Praticien introuvable");

  await prisma.blockedSlot.create({
    data: { startsAt, endsAt, reason, practitionerId: practitioner.id }
  });

  revalidatePath("/admin/disponibilites");
  redirect("/admin/disponibilites?success=absence");
}

async function deleteAbsence(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const id = formData.get("id") as string;
  await prisma.blockedSlot.delete({ where: { id } });
  
  revalidatePath("/admin/disponibilites");
  redirect("/admin/disponibilites?success=deleted");
}

export default async function AvailabilityPage({ searchParams }: any) {
  const availabilities = await prisma.availability.findMany({ orderBy: { dayOfWeek: 'asc' } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const absences = await prisma.blockedSlot.findMany({ 
    where: { endsAt: { gte: today } },
    orderBy: { startsAt: 'asc' }
  });

  const error = searchParams?.error;
  const success = searchParams?.success;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Horaires & Disponibilités</h1>
        <p className="font-body text-primary/60 text-lg">Gérez vos horaires de travail et vos absences exceptionnelles.</p>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-[20px] flex items-start animate-fade-in-up">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
          <div><h3 className="font-bold text-lg">Mise à jour impossible</h3><p className="mt-1 text-red-600/80">{error}</p></div>
        </div>
      )}

      {success === "1" && (
        <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" /><h3 className="font-bold text-lg">Horaires mis à jour.</h3>
        </div>
      )}
      {success === "absence" && (
        <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" /><h3 className="font-bold text-lg">Absence ajoutée avec succès.</h3>
        </div>
      )}
      {success === "deleted" && (
        <div className="p-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" /><h3 className="font-bold text-lg">Absence supprimée. Le créneau est de nouveau libre.</h3>
        </div>
      )}

      {/* BLOC 1 : HORAIRES NORMAUX */}
      <div className="bg-white p-8 md:p-12 rounded-[30px] border border-primary/10 shadow-sm">
        <h2 className="text-2xl font-heading font-bold text-primary mb-8 border-b border-border pb-4 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-secondary" /> Semaine Type
        </h2>
        <div className="space-y-6">
          {availabilities.map((avail) => (
            <div key={avail.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-border hover:border-primary/20 transition-colors gap-4">
              <div className="flex items-center md:w-1/3">
                <h3 className="font-heading text-xl font-bold text-primary">{DAYS_OF_WEEK[avail.dayOfWeek]}</h3>
              </div>
              <form action={updateAvailability} className="flex flex-1 items-center gap-4 w-full">
                <input type="hidden" name="id" value={avail.id} />
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-1">Début</label>
                  <input type="time" name="startTime" defaultValue={avail.startTime} className="w-full p-3 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none font-body text-primary" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-1">Fin</label>
                  <input type="time" name="endTime" defaultValue={avail.endTime} className="w-full p-3 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none font-body text-primary" />
                </div>
                <div className="pt-5">
                  <button type="submit" className="p-3 bg-secondary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors"><Save className="w-5 h-5" /></button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* BLOC 2 : ABSENCES EXCEPTIONNELLES */}
      <div className="bg-primary p-8 md:p-12 rounded-[30px] shadow-xl text-[#FAFAF7]">
        <h2 className="text-2xl font-heading font-bold mb-8 border-b border-[#FAFAF7]/10 pb-4 flex items-center">
          <CalendarOff className="w-6 h-6 mr-3 text-secondary" /> Vacances & Absences
        </h2>
        
        {/* Formulaire d'ajout */}
        <form action={addAbsence} className="flex flex-col md:flex-row items-end gap-4 bg-[#FAFAF7]/5 p-6 rounded-2xl border border-[#FAFAF7]/10 mb-8">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-[10px] font-bold text-[#FAFAF7]/50 uppercase tracking-widest mb-1">Motif</label>
            <input type="text" name="reason" placeholder="Ex: Congés" className="w-full p-3 border border-[#FAFAF7]/20 rounded-xl bg-transparent focus:border-secondary outline-none font-body text-sm" />
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-[10px] font-bold text-[#FAFAF7]/50 uppercase tracking-widest mb-1">Date</label>
            <input type="date" name="date" required className="w-full p-3 border border-[#FAFAF7]/20 rounded-xl bg-transparent focus:border-secondary outline-none font-body text-sm" />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto">
              <label className="block text-[10px] font-bold text-[#FAFAF7]/50 uppercase tracking-widest mb-1">De</label>
              <input type="time" name="startTime" defaultValue="09:00" required className="w-full p-3 border border-[#FAFAF7]/20 rounded-xl bg-transparent focus:border-secondary outline-none font-body text-sm" />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-[10px] font-bold text-[#FAFAF7]/50 uppercase tracking-widest mb-1">À</label>
              <input type="time" name="endTime" defaultValue="21:00" required className="w-full p-3 border border-[#FAFAF7]/20 rounded-xl bg-transparent focus:border-secondary outline-none font-body text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto px-6 py-3 bg-secondary text-primary rounded-xl font-bold uppercase tracking-wider hover:bg-white transition flex items-center justify-center">
            <Plus className="w-5 h-5 md:mr-2" /> <span className="md:hidden ml-2">Ajouter</span>
          </button>
        </form>

        {/* Liste des absences */}
        <div className="space-y-4">
          {absences.length === 0 ? (
            <p className="text-[#FAFAF7]/50 text-sm italic">Aucune absence prévue.</p>
          ) : (
            absences.map((abs) => (
              <div key={abs.id} className="flex justify-between items-center bg-[#FAFAF7]/5 p-4 rounded-xl border border-[#FAFAF7]/10">
                <div>
                  <p className="font-bold text-secondary">{format(new Date(abs.startsAt), "EEEE d MMMM yyyy", { locale: fr })}</p>
                  <p className="text-sm text-[#FAFAF7]/70">De {format(new Date(abs.startsAt), "HH:mm")} à {format(new Date(abs.endsAt), "HH:mm")} — {abs.reason}</p>
                </div>
                <form action={deleteAbsence}>
                  <input type="hidden" name="id" value={abs.id} />
                  <button type="submit" className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition" title="Supprimer">
                    <Trash2 className="w-5 h-5" />
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