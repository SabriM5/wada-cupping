import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function Services() {
  const dbServices = await prisma.service.findMany({
    where: { isActive: true }
  });

  const RITUELS_VISUELS = [
    {
      keyword: "compression",
      anchor: "decompression",
      title: "Rituel Décompression & Récupération",
      description: "Dédié aux tensions musculaires profondes accumulées avec le stress, les postures du quotidien ou la pratique sportive. Le travail ciblé des ventouses libère les nœuds et débloque la chaîne postérieure pour :",
      bullets: [
        "Défaire les nœuds musculaires et tensions chroniques (dos, trapèzes, épaules, nuque).",
        "Soulager les migraines de tension, céphalées et pressions crâniennes.",
        "Apaiser le système nerveux, réduire le stress, l'anxiété et favoriser un sommeil réparateur.",
        "Accélérer la récupération sportive en éliminant les toxines et courbatures."
      ],
      rhythm: "Rythme conseillé : 1 séance tous les 7 à 14 jours.",
      img: "/images/page5-service1.webp"
    },
    {
      keyword: "silhouette",
      anchor: "silhouette",
      title: "Rituel Silhouette & Légèreté",
      description: "Conçu pour relancer la circulation sanguine et lymphatique, drainer les fluides stagnants et lisser les capitons. Le glissé ciblé des ventouses mobiles vient décoller les adhésions et désengorger les tissus pour remodeler la silhouette. Résultats ciblés :",
      bullets: [
        "Drainage & Rétention d'eau : Désengorge les tissus et évacue l'excès d'eau.",
        "Action anti-cellulite : Lisse la peau d'orange sur les cuisses, les fessiers et le ventre.",
        "Légèreté immédiate : Libère la sensation de jambes lourdes et active le retour veineux.",
        "Fermeté cutanée : Stimule la microcirculation pour une peau plus tonique et plus ferme."
      ],
      rhythm: "Rythme conseillé : 1 séance tous les 7 à 10 jours.",
      img: "/images/page5-service-silhouette.webp"
    },
    {
      keyword: "minit",
      anchor: "feminite",
      title: "Rituel Féminité, Équilibre & Confort Pelvien",
      description: "Un accompagnement doux, chaleureux et libérateur dédié au bien-être gynécologique, au transit et à l'harmonie du cycle féminin afin de :",
      bullets: [
        "Soulager les douleurs pelviennes et inconforts du cycle (endométriose, règles douloureuses, SOPK).",
        "Accompagner les déséquilibres menstruels (absence de règles/aménorrhée, cycles irréguliers).",
        "Stimuler la circulation du bassin en soutien aux projets de grossesse (fertilité/PMA).",
        "Décongestionner le bas-ventre et harmoniser le transit (ballonnements, constipation)."
      ],
      rhythm: "Rythme conseillé : 1 à 2 séances par mois, adaptées aux phases du cycle menstruel (hors règles abondantes).",
      img: "/images/page5-service2.webp"
    },
    {
      keyword: "glow",
      anchor: "glow-lift",
      title: "Rituel Glow & Lift Facial",
      description: "Un soin d'exception réalisé avec des mini-ventouses en verre médical de haute précision, combinant stimulation cutanée et drainage doux afin de :",
      bullets: [
        "Activer la microcirculation et redonner un éclat immédiat au teint terne.",
        "Stimuler la production naturelle de collagène et d'élastine (effet repulpant & anti-âge).",
        "Drainer les poches, cernes et excès de fluides du visage.",
        "Relâcher les tensions de la mâchoire (bruxisme) et soulager les migraines frontales ou sinusales."
      ],
      rhythm: "Rythme conseillé : 1 séance tous les 7 à 10 jours.",
      img: "/images/page5-service3.webp"
    },
    {
      keyword: "combo", // Le mot clé reste "mesure" pour le lien avec la base
      anchor: "sur-mesure",
      title: "Soin Combo Grand Cru WADA",
      description: "La combinaison sur-mesure de deux rituels complets lors d'une même séance pour une prise en charge globale du corps (ex. 45 min Dos, Nuque & Migraines + 45 min Confort Pelvien ou 60 min Corps + 30 min Visage).",
      bullets: [
        "Une attention totale dédiée à votre relâchement absolu.",
        "Personnalisation intégrale selon votre bilan du jour.",
        "Pour inscrire les bénéfices dans la durée, une cure est vivement recommandée."
      ],
      rhythm: "Rythme conseillé : 1 séance toutes les 2 à 3 semaines.",
      img: "/images/page-surmesure.webp"
    }
  ];

  return (
    <section id="prestations" className="py-32 bg-background scroll-mt-20">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <h2 className="font-nimbus text-5xl md:text-7xl text-primary mb-6">Nos Rituels</h2>
          <p className="font-heading text-primary/60 text-xl italic">L'exigence d'un soin profond, l'élégance du sur-mesure.</p>
        </div>

        <div className="space-y-16">
          {RITUELS_VISUELS.map((rituel) => {
            const dbService = dbServices.find(s => s.name.toLowerCase().includes(rituel.keyword.toLowerCase()));
            if (!dbService) return null;

            return (
              <div key={dbService.id} id={rituel.anchor} className="scroll-mt-32 group">
                
                {/* En-tête : Titre et Tarifs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-6 mb-8">
                  <div className="md:w-2/3">
                    <h3 className="font-heading text-3xl md:text-4xl text-primary font-bold mb-2 group-hover:text-secondary transition-colors">
                      {rituel.title}
                    </h3>
                    
                    {/* Prix à l'unité */}
                    <p className="font-body text-secondary text-sm font-bold uppercase tracking-widest mt-4">
                      Soin Découverte : {dbService.durationMin} MIN — {dbService.price} €
                    </p>
                    
                    {/* Affichage conditionnel de la Cure */}
                    {dbService.cureName && dbService.curePrice && dbService.cureSessions && (
                      <p className="font-body text-primary/80 text-sm font-bold uppercase tracking-widest mt-2">
                        {dbService.cureName} : {dbService.curePrice} € <span className="text-primary/50 text-xs normal-case font-normal ml-1">(soit {Math.round(dbService.curePrice / dbService.cureSessions)} € la séance)</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 md:mt-0">
                    <Link 
                      href={`/reservation?service=${dbService.id}`}
                      className="inline-block px-8 py-3 rounded-full font-body text-xs font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-5 relative h-[300px] lg:h-auto rounded-[30px] overflow-hidden">
                    <Image src={rituel.img} alt={rituel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  
                  <div className="lg:col-span-7 space-y-6">
                    <p className="font-heading text-primary/90 text-xl leading-relaxed italic">
                      "{rituel.description}"
                    </p>
                    
                    <ul className="space-y-4 font-body text-primary/70 text-sm md:text-base leading-relaxed">
                      {rituel.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 mr-4 flex-shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-primary/10">
                      <p className="font-body text-xs font-bold uppercase tracking-wider text-secondary">
                        {rituel.rhythm}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}