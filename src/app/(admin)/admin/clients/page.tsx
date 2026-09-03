import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { User, Phone, Mail, MapPin, Award, Plus, Minus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

// --- ACTION SERVEUR : MISE À JOUR DE LA FIDÉLITÉ ---
async function updateLoyalty(formData: FormData) {
  "use server";
  const profileId = formData.get("profileId") as string;
  const action = formData.get("action") as "increment" | "decrement";

  const profile = await prisma.customerProfile.findUnique({ where: { id: profileId } });
  if (!profile) return;

  // On ajoute 1, ou on retire 1 (sans jamais descendre en dessous de 0)
  const newCount = action === "increment" ? profile.visitsCount + 1 : Math.max(0, profile.visitsCount - 1);

  await prisma.customerProfile.update({
    where: { id: profileId },
    data: { visitsCount: newCount }
  });

  revalidatePath("/admin/clients");
}

export default async function ClientsPage() {
  // On récupère tous les clients (rôle CUSTOMER) avec leur profil et leurs rendez-vous
  const clients = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { 
      customerProfile: true,
      appointments: {
        orderBy: { startsAt: 'desc' },
        include: { service: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // On filtre pour ne garder que ceux qui ont bien un profil renseigné
  const validClients = clients.filter(c => c.customerProfile);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Carnet Client & Fidélité</h1>
          <p className="font-body text-primary/60 text-lg">Gérez vos contacts et récompensez la fidélité de vos clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {validClients.length === 0 ? (
          <div className="bg-white p-12 rounded-[30px] border border-primary/10 text-center">
            <User className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="font-heading text-xl text-primary/60">Vous n'avez pas encore de clients dans votre base.</p>
          </div>
        ) : (
          validClients.map((client) => {
            const profile = client.customerProfile!;
            const lastAppt = client.appointments[0]; // Le RDV le plus récent
            const totalAppts = client.appointments.filter(a => a.status === "COMPLETED" || a.status === "CONFIRMED").length;

            return (
              <div key={client.id} className="bg-white p-8 rounded-[30px] border border-primary/10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                
                {/* 1. Informations de contact */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mr-4 text-primary font-heading font-bold text-xl">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-primary">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-sm font-body text-primary/60 uppercase tracking-widest">
                        Client depuis {format(new Date(profile.createdAt), "MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 font-body text-sm text-primary/80">
                    <p className="flex items-center"><Mail className="w-4 h-4 mr-3 text-secondary" /> {client.email}</p>
                    <p className="flex items-center"><Phone className="w-4 h-4 mr-3 text-secondary" /> {profile.phone || "Non renseigné"}</p>
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-secondary" /> {profile.address || "Non renseignée"}</p>
                  </div>
                </div>

                {/* 2. Historique rapide */}
                <div className="flex-1 bg-[#FAFAF7] p-5 rounded-2xl border border-border w-full md:w-auto">
                  <h3 className="font-heading text-lg font-bold text-primary mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary/50" /> Historique ({totalAppts} soins)
                  </h3>
                  {lastAppt ? (
                    <div>
                      <p className="text-sm font-body text-primary/70 mb-1">Dernier rendez-vous :</p>
                      <p className="font-bold text-primary text-sm">{format(new Date(lastAppt.startsAt), "dd/MM/yyyy")} - {lastAppt.service.name}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                        {lastAppt.status}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-body text-primary/50 italic">Aucun rendez-vous passé.</p>
                  )}
                </div>

                {/* 3. Compteur de Fidélité Interactif */}
                <div className="flex-shrink-0 flex flex-col items-center bg-secondary/5 p-6 rounded-2xl border border-secondary/20 w-full md:w-48">
                  <Award className="w-8 h-8 text-secondary mb-2" />
                  <p className="font-heading text-sm text-primary/70 uppercase tracking-widest mb-2">Fidélité</p>
                  <p className="font-heading text-4xl font-bold text-primary mb-4">{profile.visitsCount}</p>
                  
                  <div className="flex gap-2">
                    <form action={updateLoyalty}>
                      <input type="hidden" name="profileId" value={profile.id} />
                      <input type="hidden" name="action" value="decrement" />
                      <button type="submit" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                    </form>
                    
                    <form action={updateLoyalty}>
                      <input type="hidden" name="profileId" value={profile.id} />
                      <input type="hidden" name="action" value="increment" />
                      <button type="submit" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-green-50 hover:text-green-500 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
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