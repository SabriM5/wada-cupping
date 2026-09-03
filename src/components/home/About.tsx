import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <section id="a-propos" className="py-32 bg-background scroll-mt-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          
          {/* Bloc Image (Prend 5 colonnes) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-secondary/10 rounded-t-full rounded-b-[40px] transform -rotate-3"></div>
            <div className="relative h-[650px] w-full rounded-t-full rounded-b-[40px] overflow-hidden shadow-2xl">
              <Image src="/images/page4-about.webp" alt="Praticienne Cupping Therapy" fill className="object-cover" />
            </div>
          </div>

          {/* Espace vide (1 colonne) */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Bloc Texte (Prend 6 colonnes) */}
          <div className="lg:col-span-6 relative z-10 pt-10 lg:pt-0">
            <div className="absolute -top-20 -left-10 text-[12rem] font-nimbus text-primary/5 select-none hidden md:block">
              W
            </div>
            <p className="text-secondary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-6 block">
              L'expertise à votre service
            </p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary font-bold mb-10 leading-tight">
              Une approche centrée sur <br/><span className="text-secondary italic font-light">votre bien-être.</span>
            </h2>
            <div className="space-y-6 font-body text-primary/70 leading-relaxed text-lg mb-10 border-l px-6 border-secondary/30">
              <p>
                Passionnée par les méthodes de récupération naturelle, j'ai fondé cette structure avec un objectif simple : rendre la thérapie par ventouses accessible, sûre et profondément relaxante.
              </p>
              <p>
                Chaque corps raconte une histoire. Mon rôle est de vous écouter pour vous offrir une parenthèse où le temps s'arrête.
              </p>
            </div>
            <Link href="/#prestations" className="inline-block border-b-2 border-primary pb-1 font-heading text-lg font-bold text-primary hover:text-secondary hover:border-secondary transition-colors">
              Découvrir mes rituels
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}