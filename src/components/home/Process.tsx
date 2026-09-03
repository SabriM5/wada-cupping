export default function Process() {
  const steps = [
    { num: "01", title: "Le Diagnostic", desc: "Un temps d'échange privilégié pour comprendre vos besoins, vos tensions et adapter le soin à votre corps." },
    { num: "02", title: "Le Cocon", desc: "Mise en place de la table professionnelle et du linge chauffant directement dans votre espace de vie." },
    { num: "03", title: "Le Rituel", desc: "60 à 90 minutes de relâchement total. Application experte des ventouses pour libérer chaque blocage." }
  ];

  return (
    <section id="comment-ca-marche" className="py-32 bg-[#FAFAF7] scroll-mt-20 border-y border-primary/5">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-24">
          <p className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-4">L'Art de recevoir</p>
          <h2 className="font-heading text-4xl md:text-5xl text-primary font-bold">Votre séance à domicile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              {/* Le numéro géant en arrière-plan */}
              <div className="absolute -top-16 font-nimbus text-[8rem] text-primary/5 group-hover:text-secondary/10 transition-colors duration-500 select-none">
                {step.num}
              </div>
              
              <div className="relative z-10 pt-16">
                <h4 className="font-heading text-2xl text-primary font-bold mb-4">{step.title}</h4>
                <div className="w-12 h-px bg-secondary/50 mx-auto mb-6"></div>
                <p className="text-primary/70 font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}