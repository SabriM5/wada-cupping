import { Briefcase, Mail } from "lucide-react";

export default function Corporate() {
  return (
    <section id="entreprises" className="py-24 bg-background px-6 lg:px-8">
      <div className="max-w-[1000px] mx-auto bg-primary text-[#FAFAF7] rounded-[40px] p-10 md:p-16 shadow-2xl relative overflow-hidden">
        
        {/* Décoration discrète en arrière-plan */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Briefcase className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="md:w-2/3">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Offre Entreprises & Événementiel
            </h2>
            <p className="font-heading text-secondary text-xl italic mb-6">
              La Qualité de Vie au Travail (QVT) par l'excellence.
            </p>
            <p className="font-body text-[#FAFAF7]/80 leading-relaxed mb-6">
              Améliorez le bien-être de vos collaborateurs, réduisez le stress et les tensions posturales liées au bureau. Que ce soit pour des interventions régulières en entreprise, des journées bien-être (Team Building) ou des événements privés, Amira se déplace avec son matériel pour des sessions sur-mesure.
            </p>
            <ul className="space-y-2 font-body text-sm text-[#FAFAF7]/70">
              <li className="flex items-center"><span className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></span> Ateliers découverte & Massages express</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></span> Gestion du stress et prévention des TMS (Troubles Musculo-Squelettiques)</li>
            </ul>
          </div>

          <div className="md:w-1/3 flex justify-center md:justify-end w-full">
            <a 
              href="mailto:contact@wada-cupping.fr?subject=Demande de devis - WADA Cupping Entreprise&body=Bonjour Amira,%0D%0A%0D%0ANous souhaiterions obtenir un devis pour une intervention au sein de notre entreprise.%0D%0A%0D%0A- Nom de l'entreprise : %0D%0A- Date(s) souhaitée(s) : %0D%0A- Nombre de collaborateurs concernés : %0D%0A- Besoins spécifiques : %0D%0A%0D%0AMerci par avance,"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-secondary text-primary font-body font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors duration-300 w-full md:w-auto text-center"
            >
              <Mail className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              Demander un devis
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}