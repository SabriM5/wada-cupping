import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Star, PowerOff, Activity, Save, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

// --- ACTIONS SERVEUR ---
async function toggleServiceStatus(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  await prisma.service.update({
    where: { id },
    data: { isActive: !currentStatus }
  });

  revalidatePath("/admin/prestations");
  redirect("/admin/prestations?success=status");
}

async function updateServicePrice(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Non autorisé");

  const id = formData.get("id") as string;
  const price = parseInt(formData.get("price") as string);

  await prisma.service.update({
    where: { id },
    data: { price }
  });

  revalidatePath("/admin/prestations");
  redirect("/admin/prestations?success=price");
}

export default async function PrestationsPage({ searchParams }: any) {
  const services = await prisma.service.findMany({
    orderBy: { price: 'asc' }
  });
  
  const success = searchParams?.success;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Prestations & Rituels</h1>
          <p className="font-body text-primary/60 text-lg">Gérez votre catalogue de soins, vos tarifs et leur disponibilité.</p>
        </div>
      </div>

      {success === "price" && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Le tarif du soin a été mis à jour avec succès.</h3>
        </div>
      )}

      {success === "status" && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-[20px] flex items-center animate-fade-in-up">
          <CheckCircle2 className="w-6 h-6 mr-4 flex-shrink-0" />
          <h3 className="font-bold text-lg">Le statut du soin a été modifié.</h3>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {services.map((service) => (
          <div key={service.id} className={`bg-white p-8 rounded-[30px] border transition-all ${service.isActive ? 'border-primary/10 shadow-sm hover:shadow-md' : 'border-border opacity-60'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${service.isActive ? 'bg-secondary/20 text-secondary' : 'bg-border text-primary/40'}`}>
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-primary">{service.name}</h2>
                  <p className="font-body text-sm text-primary/60 mt-1">{service.durationMin} minutes de soin</p>
                </div>
              </div>
            </div>
            
            <p className="font-heading text-primary/80 mb-8 min-h-[50px]">{service.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 border-t border-border pt-6">
              <form action={updateServicePrice} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="id" value={service.id} />
                <div className="relative w-full">
                  <input type="number" name="price" defaultValue={service.price} className="w-full p-3 border border-border rounded-xl bg-[#FAFAF7] focus:border-primary outline-none font-bold text-primary" />
                  <span className="absolute right-4 top-3 text-primary/60 font-bold">€</span>
                </div>
                <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition" title="Enregistrer le prix">
                  <Save className="w-5 h-5" />
                </button>
              </form>

              <form action={toggleServiceStatus} className="flex-1">
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="currentStatus" value={service.isActive.toString()} />
                <button type="submit" className={`w-full h-full px-4 py-3 rounded-xl font-body text-sm font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${service.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {service.isActive ? <><PowerOff className="w-4 h-4 mr-2" /> Suspendre</> : <><Activity className="w-4 h-4 mr-2" /> Activer</>}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}