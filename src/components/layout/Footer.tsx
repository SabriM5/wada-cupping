import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAF7] text-primary pt-20 pb-10 border-t border-primary/10">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Colonne 1 : EXPLORER */}
          <div>
            <h4 className="font-heading text-2xl font-bold mb-6 tracking-wide uppercase">Explorer</h4>
            <ul className="space-y-4 font-heading text-lg text-primary/80">
              <li><Link href="/#a-propos" className="hover:text-secondary transition">• L'Expérience</Link></li>
              <li><Link href="/#prestations" className="hover:text-secondary transition">• Nos Rituels</Link></li>
              <li><Link href="/#philosophie" className="hover:text-secondary transition">• Philosophie</Link></li>
              <li><Link href="/#faq" className="hover:text-secondary transition">• F.A.Q.</Link></li>
              <li><Link href="/#secteur" className="hover:text-secondary transition">• Secteur d'intervention</Link></li>
            </ul>
          </div>

          {/* Colonne 2 : CONTACT */}
          <div>
            <h4 className="font-heading text-2xl font-bold mb-6 tracking-wide uppercase">Contact</h4>
            <div className="space-y-4 font-heading text-lg text-primary/80 leading-relaxed">
              <p>Sur rendez-vous uniquement</p>
              <p>Plages d'intervention : <br/>Du Lundi au Vendredi — 19h00 à 21h00</p>
              <p>Du Samedi au Dimanche — 9h00 à 21h00</p>
              <p>Email : wada.cupping@gmail.com</p>
            </div>
          </div>

          {/* Colonne 3 : RÉSEAUX SOCIAUX */}
          <div>
            <h4 className="font-heading text-2xl font-bold mb-6 tracking-wide uppercase">Réseaux Sociaux</h4>
            <p className="font-heading text-lg text-primary/80 leading-relaxed mb-6">
              Rejoignez notre communauté. 
              Envoyez nous un message.
            </p>
            <a href="https://instagram.com/wada_cupping" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-110 transition-transform">
              <div className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white p-3 rounded-2xl shadow-md flex items-center justify-center">
                {/* Code SVG natif du logo Instagram (Plus besoin d'import) */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" height="24" viewBox="0 0 24 24" 
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className="w-8 h-8"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </div>
            </a>
          </div>

        </div>
        
        {/* Mentions légales */}
        <div className="text-center pt-8 border-t border-primary/10 font-heading text-primary/50 text-sm">
          <p>&copy; {new Date().getFullYear()} WADA. Tous droits réservés. | <Link href="/legal" className="hover:underline">Mentions légales</Link></p>
        </div>

      </div>
    </footer>
  );
}