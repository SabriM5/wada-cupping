export default function Benefits() {
  return (
    <section className="py-32 md:py-48 bg-background relative overflow-hidden" id="philosophie">
      {/* Filigrane géant en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] select-none">
        <span className="font-nimbus text-[15rem] md:text-[25rem] leading-none">WADA</span>
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-6 flex flex-col items-center text-center">
        <span className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-8 block">
          Notre Philosophie
        </span>
        
        <h2 className="font-heading text-3xl md:text-5xl text-primary font-bold leading-[1.4] mb-12">
          Le privilège d'un soin d'exception, <br className="hidden md:block" />
          <span className="italic font-light text-secondary">dans la chaleur de votre cocon.</span>
        </h2>

        {/* Séparateur vertical élégant */}
        <div className="w-px h-20 bg-secondary/30 mb-12"></div>

        <div className="font-body text-primary/70 text-lg md:text-xl leading-[2.2] space-y-8 max-w-[600px]">
          <p>
            WADA est née d'une conviction : le véritable luxe réside dans l'attention portée au corps et au temps que l'on s'accorde.
          </p>
          <p>
            Alliant la précision de la ventousothérapie sèche à une approche enveloppante du bien-être, chaque séance est pensée comme un rituel sur mesure. Nous apportons le soin et l'exigence du bien-être directement dans votre espace, pour une parenthèse de détente absolue.
          </p>
        </div>

        <div className="mt-20 pt-10 border-t border-primary/10 w-full max-w-[400px]">
          <p className="font-heading italic text-primary/80 text-xl tracking-wide">
            "L'alliance du geste ancestral et du confort absolu."
          </p>
        </div>
      </div>
    </section>
  );
}