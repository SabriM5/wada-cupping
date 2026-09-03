import { Metadata } from "next";
import prisma from "@/lib/prisma";
import BookingForm from "@/components/booking/BookingForm";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Réserver votre soin | WADA",
  description: "Réservez votre rituel de ventousothérapie à domicile.",
};

export default async function BookingPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-6xl text-primary font-bold mb-4 tracking-wide">
            Votre parenthèse sur mesure
          </h1>
          <p className="font-heading italic text-primary/70 text-xl md:text-2xl">
            Sélectionnez votre rituel et choisissez votre créneau.
          </p>
        </div>
        
        {/* Le formulaire interactif */}
        <BookingForm services={services} />
      </div>
    </div>
  );
}