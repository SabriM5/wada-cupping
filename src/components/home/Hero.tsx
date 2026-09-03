{/*import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/videos/page1-hero.mp4" type="video/mp4" />
      </video>
      
      {/* Overlays allégés pour laisser la vidéo respirer tout en gardant le texte lisible 
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12">
        
        {/* Titre WADA très grand et espacé 
        <h1 className="font-heading text-7xl md:text-8xl lg:text-[10rem] text-[#FAFAF7] font-bold tracking-widest leading-none mb-4 drop-shadow-xl animate-fade-in-up">
          WADA
        </h1>
        
        {/* Sous-titre séparé 
        <h2 className="font-heading text-xl md:text-2xl lg:text-3xl text-[#FAFAF7] tracking-[0.15em] mb-8 drop-shadow-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          RALENTIR. RESSENTIR. RESONNER
        </h2>
        
        {/* Paragraphe en italique (Serif) *
        <p className="font-heading italic text-[#FAFAF7]/95 text-lg md:text-xl mb-12 max-w-3xl font-light drop-shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          WADA réinvente la ventousothérapie dans une expérience d’exception, façonnée pour apaiser le corps et libérer l'esprit.
        </p>
        
        {/* Bouton "Outline" style Canva *
        <Link 
          href="/reservation" 
          className="px-10 py-4 rounded-full font-body font-medium text-white border-[3px] border-primary bg-white/10 backdrop-blur-sm hover:bg-primary hover:text-surface transition-all duration-300 shadow-lg animate-fade-in-up" 
          style={{ animationDelay: '0.3s' }}
        >
          Découvrir l'expérience
        </Link>
        
      </div>
    </section>
  );
}
*/}


import Link from "next/link";




export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">

      {/* Vidéo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/page1-hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 z-10" />

      {/* Contenu */}
      <div className="relative z-20 flex flex-col items-center text-center px-6">

        <h1 
          className="font-nimbus text-[6rem] md:text-[10rem] lg:text-[12rem] text-[#FAFAF7] tracking-widest mb-6 leading-none drop-shadow-2xl"
        >
          WADA
        </h1>

        <p
          className="
            font-heading
            text-sm
            md:text-lg
            text-[#FAFAF7]/90
            uppercase
            tracking-[0.3em]
            mb-10
            drop-shadow-md
            animate-fade-in-up
          "
          style={{ animationDelay: "0.15s" }}
        >
          L'art de la ventousothérapie
        </p>

        <Link
          href="/reservation"
          className="
            group
            inline-flex
            items-center
            gap-4
            px-9
            py-4
            rounded-full
            border
            border-[#FAFAF7]/70
            bg-[#FAFAF7]/10
            backdrop-blur-md
            text-[#FAFAF7]
            font-body
            text-sm
            font-medium
            uppercase
            tracking-[0.18em]
            transition-all
            duration-500
            hover:bg-[#FAFAF7]
            hover:text-primary
            hover:border-[#FAFAF7]
            hover:px-11
            shadow-lg
            animate-fade-in-up
          "
          style={{ animationDelay: "0.3s" }}
        >
          Réserver mon rituel

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>

      </div>

      {/* Scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 text-[#FAFAF7]/60">
        <span className="font-body text-[10px] uppercase tracking-[0.35em]">
          Découvrir
        </span>

        <div className="w-px h-10 bg-[#FAFAF7]/40" />
      </div>

    </section>
  );
}

