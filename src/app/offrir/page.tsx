import prisma from "@/lib/prisma";
import GiftCardForm from "@/components/gift/GiftCardForm";

export const metadata = {
  title: "Offrir un Bon Cadeau | WADA Cupping",
  description: "Offrez un rituel de bien-être sur-mesure.",
};

export default async function OffrirPage() {
  // On récupère la liste des soins disponibles
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  return (
    <main className="pt-32 pb-24 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="font-nimbus text-5xl md:text-7xl text-primary mb-6">Offrir un Rituel</h1>
          <p className="font-heading text-primary/60 text-xl italic max-w-2xl mx-auto">
            Une parenthèse de bien-être absolu et de déconnexion à glisser entre leurs mains. Le bon cadeau est valable 1 an.
          </p>
        </div>

        {/* Le formulaire client que l'on vient de créer */}
        <GiftCardForm services={services} />
        
      </div>
    </main>
  );
}