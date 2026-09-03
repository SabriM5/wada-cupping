import { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import VideoBanner from "@/components/home/VideoBanner";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import Process from "@/components/home/Process";
import FaqAccordion from "@/components/features/FaqAccordion";
import CallToAction from "@/components/home/CallToAction";
import ServiceArea from "@/components/home/ServiceArea";
import Privileges from "@/components/home/Privileges"; // <-- Oubli corrigé

export const metadata: Metadata = {
  title: "Cupping Therapy à domicile | Bien-être & Détente",
  description: "Séances de cupping therapy à domicile.",
};

export default function HomePage() {
  return (
    <div className="w-full">
      <Hero />
      <Benefits />
      <VideoBanner />
      <About />
      <Services />
      <Process />
      
      {/* FAQ avec layout asymétrique type Éditorial */}
      <section id="faq" className="py-32 bg-white scroll-mt-20">
         <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              
              <div className="lg:w-1/3 lg:sticky lg:top-32">
                <span className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-6 block">
                  Informations
                </span>
                <h2 className="font-heading text-4xl md:text-5xl text-primary font-bold mb-6 leading-tight">
                  Vos <br/><span className="italic font-light text-secondary">Questions.</span>
                </h2>
                <p className="font-body text-primary/60 text-lg leading-relaxed">
                  Tout ce que vous devez savoir avant de réserver votre premier rituel à domicile.
                </p>
              </div>

              <div className="lg:w-2/3 w-full">
                <FaqAccordion />
              </div>

            </div>
          </div>
      </section>

      <ServiceArea />
      <Privileges /> {/* <-- Intégration des privilèges avant le footer */}
      <CallToAction />
    </div>
  );
}