export default function VideoBanner() {
  return (
    <section>
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/page3-banner.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#FAFAF7] tracking-widest uppercase drop-shadow-lg">
            Nos Rituels
          </h2>
          <p className="font-heading text-xl md:text-2xl lg:text-3xl text-[#FAFAF7] font-light italic drop-shadow-md">
            Une prise en charge sur-mesure, dédiée à votre équilibre.
          </p>
        </div>
      </div>

      <div className="bg-[#FAFAF7] py-32 px-6 flex items-center justify-center border-b border-primary/5">
        <div className="max-w-[800px] text-center space-y-8">
          <span className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs block">
            Notre Promesse
          </span>
          <p className="font-heading text-primary/90 text-2xl md:text-4xl leading-[1.6]">
            Un temps d'arrêt <span className="italic font-light text-secondary">absolu.</span>
          </p>
          <p className="font-body text-primary/70 text-lg leading-relaxed max-w-[600px] mx-auto">
            Chaque rendez-vous comprend 60 minutes effectives de soin, précédées d'un échange personnalisé et suivies d'un retour au calme en douceur.
          </p>
          <div className="w-12 h-px bg-secondary/50 mx-auto mt-8 mb-4"></div>
          <p className="font-body text-primary/40 text-xs uppercase tracking-[0.2em]">
            Prévoyez environ 1h30 de présence
          </p>
        </div>
      </div>
    </section>
  );
}