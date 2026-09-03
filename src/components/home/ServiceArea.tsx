import { MapPin } from "lucide-react";

export default function ServiceArea() {
  const areas = [
    { dep: "Yvelines (78)", cities: "Versailles, Jouy-en-Josas, Buc, Viroflay, Saint-Cyr-l'École, Le Chesnay, Guyancourt, Voisins-le-Bx, Montigny, Chavenay, Bailly, Noisy-le-Roi, Bougival, La Celle-St-Cloud." },
    { dep: "Hauts-de-Seine (92)", cities: "Meudon, Clamart, Sèvres, Chaville, Issy-les-Moulineaux, Boulogne, Saint-Cloud, Marnes-la-Coquette, Ville-d'Avray, Le Plessis-Robinson, Châtenay-Malabry, Fontenay, Bagneux, Montrouge, Vanves, Malakoff, Antony, Sceaux." },
    { dep: "Essonne (91)", cities: "Bièvres, Verrières-le-Buisson, Igny, Massy, Palaiseau, Saclay, Gif-sur-Yvette." },
    { dep: "Paris (75)", cities: "Arrondissements du Sud et Ouest (14e, 15e, 16e)." }
  ];

  return (
    <section id="secteur" className="py-32 bg-[#FAFAF7] scroll-mt-20 border-y border-primary/5">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Colonne Gauche : Introduction (Fixe au scroll sur grand écran) */}
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <span className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-6 block">
              Zone d'intervention
            </span>
            <h2 className="font-heading text-4xl md:text-5xl text-primary font-bold mb-6 leading-tight">
              Le spa vient <br/><span className="italic font-light text-secondary">à vous.</span>
            </h2>
            <p className="font-body text-primary/70 text-lg leading-relaxed mb-8">
              Les rituels WADA sont proposés directement à votre domicile. Le déplacement est offert pour l'ensemble des communes listées.
            </p>
            
            {/* L'avertissement Hors-Zone transformé en note premium */}
            <div className="p-6 bg-white rounded-2xl border border-primary/10 shadow-sm">
              <h4 className="font-heading text-primary font-bold mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-secondary" /> Demande spécifique
              </h4>
              <p className="font-body text-sm text-primary/60 leading-relaxed">
                Pour toute intervention hors zone, un supplément de 1€/km s'applique. N'hésitez pas à nous contacter pour une demande particulière.
              </p>
            </div>
          </div>

          {/* Colonne Droite : Grille des départements */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[30px] border border-primary/10 shadow-sm hover:shadow-md transition-shadow group">
                <div className="text-secondary font-heading text-4xl mb-2 opacity-20 group-hover:opacity-100 transition-opacity">
                  {area.dep.match(/\(([^)]+)\)/)?.[1]} {/* Extrait juste le numéro (78, 92...) */}
                </div>
                <h3 className="font-heading text-xl font-bold text-primary mb-4">
                  {area.dep.split(' (')[0]} {/* Extrait juste le nom du département */}
                </h3>
                <p className="font-body text-sm text-primary/60 leading-relaxed">
                  {area.cities}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}