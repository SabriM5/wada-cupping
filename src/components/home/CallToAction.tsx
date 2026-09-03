import Link from "next/link";
import Image from "next/image";

export default function CallToAction() {
  return (
    <section className="relative min-h-[80vh] py-32 md:py-40 text-[#FAFAF7] overflow-hidden flex items-center justify-center text-center px-6">
      
      <Image
        src="/images/page13-cta.webp"
        alt="Soin Ventousothérapie WADA"
        fill
        className="object-cover z-0"
      />
      
      <div className="absolute inset-0 bg-black/20 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      
      <div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto mt-20">
        <p className="font-body text-[#FAFAF7]/80 text-xs md:text-sm uppercase tracking-[0.4em] mb-6">
          L'expérience WADA
        </p>
        <div className="font-nimbus text-[6rem] md:text-[12rem] leading-none tracking-widest mb-10 drop-shadow-2xl">
          WADA
        </div>
        
        <p className="font-heading italic text-[#FAFAF7]/90 text-xl md:text-2xl max-w-xl leading-relaxed mb-12">
          Accordez-vous l'exception d'une parenthèse sur mesure.
        </p>
        
        <Link
          href="/reservation"
          className="group inline-flex items-center justify-center px-12 py-5 rounded-full bg-[#FAFAF7] text-primary font-body text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105 shadow-2xl"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </section>
  );
}