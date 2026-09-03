import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Clock, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

const DAYS_OF_WEEK = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// --- ACTION SERVEUR ---
async function updateAvailability(formData: FormData) {
  "use server";
  
  // 1. Sécurisation de l'action
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const id = formData.get("id") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  // 2. Validation de la cohérence des horaires
  if (startTime >= endTime) {
    redirect(`/admin/disponibilites?error=${encodeURIComponent("L'heure de fin doit obligatoirement être postérieure à l'heure de début.")}`);
  }

  await prisma.availability.update({
    where: { id },
    data: { startTime, endTime }
  });
  
  revalidatePath("/admin/disponibilites");
  redirect("/admin/disponibilites?success=1");
}

export default async function AvailabilityPage({ searchParams }: any) {
  const availabilities = await prisma.availability.findMany({
    orderBy: { dayOfWeek: 'asc' }
  });

  const error = searchParams?.error;
  const success = searchParams?.success;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Horaires & Disponibilités</h1>
          <p className="font-body text-primary/60 text-lg">Définissez vos plages d'intervention à domicile pour chaque jour de la semaine.</p>
        </div>
      </div>

      {/* Alertes visuelles de succès ou d'erreur */}
      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-600 rounded-[20px] flex items-start animate-fade-in-up">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Mise à jour impossible</h3>
            <p className="mt-1 text-red-600/80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Horaires mis à jour avec succès.</h3>
        </div>
      )}

      <div className="bg-white p-8 md:p-12 rounded-[30px] border border-primary/10 shadow-sm">
        <div className="space-y-6">
          {availabilities.map((avail) => (
            <div key={avail.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-border hover:border-primary/20 transition-colors gap-4">
              
              <div className="flex items-center md:w-1/3">
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-primary">
                  {DAYS_OF_WEEK[avail.dayOfWeek]}
                </h3>
              </div>

              <form action={updateAvailability} className="flex flex-1 items-center gap-4 w-full">
                <input type="hidden" name="id" value={avail.id} />
                
                <div className="flex-1">
                  <label className="block text-xs font-bold text-primary/50 uppercase tracking-widest mb-1">Début</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    defaultValue={avail.startTime}
                    className="w-full p-3 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none font-body text-primary"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-bold text-primary/50 uppercase tracking-widest mb-1">Fin</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    defaultValue={avail.endTime}
                    className="w-full p-3 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none font-body text-primary"
                  />
                </div>

                <div className="pt-5">
                  <button type="submit" className="p-3 bg-secondary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors" title="Sauvegarder">
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              </form>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}