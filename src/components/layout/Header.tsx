"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Gift, ChevronDown, User } from "lucide-react";

// Création d'une structure de menu avec sous-liens
const NAV_LINKS = [
  { name: "L'Expérience", href: "/#a-propos" },
  { 
    name: "Nos Rituels", 
    href: "/#prestations",
    subLinks: [
      { name: "Décompression & Récupération", href: "/#decompression" },
      { name: "Silhouette & Légèreté", href: "/#silhouette" },
      { name: "Féminité & Confort", href: "/#feminite" },
      { name: "Glow & Lift Facial", href: "/#glow-lift" },
      { name: "Sur-Mesure Haut de Gamme", href: "/#sur-mesure" }
    ]
  },
  { name: "Philosophie", href: "/#philosophie" },
  { name: "F.A.Q.", href: "/#faq" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openOffers = () => {
    window.dispatchEvent(new Event("openOffers"));
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-[#FAFAF7]/95 backdrop-blur-md border-b border-primary/10 py-4 shadow-sm" : "bg-transparent py-6"}`}>
      <div className="max-w-[1300px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="relative w-32 h-12 md:w-40 md:h-14 transition-transform hover:scale-105">
            <Image src="/images/logo.png" alt="WADA Cupping Therapy" fill className={`object-contain transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-90'}`} priority />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex space-x-8 items-center">
            {NAV_LINKS.map((item) => (
              <div key={item.name} className="relative group py-2">
                <Link 
                  href={item.href} 
                  className={`flex items-center font-heading text-sm uppercase tracking-widest transition-colors hover:text-secondary ${isScrolled ? "text-primary/80" : "text-[#FAFAF7]"}`}
                >
                  {item.name}
                  {item.subLinks && <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" />}
                </Link>

                {/* Le bloc du menu déroulant au survol */}
                {item.subLinks && (
                  <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-[280px] z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-primary/10 py-3 flex flex-col relative before:absolute before:-top-2 before:left-6 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-primary/10">
                      {item.subLinks.map(sub => (
                        <Link 
                          key={sub.name} 
                          href={sub.href} 
                          className="px-6 py-3 font-heading text-sm text-primary hover:bg-secondary/10 hover:text-secondary transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={openOffers} className={`flex items-center font-heading text-sm uppercase tracking-widest transition-colors hover:text-secondary ${isScrolled ? "text-secondary" : "text-[#FAFAF7]"}`}>
              <Gift className="w-4 h-4 mr-2" /> Offres
            </button>

            {/* BOUTON ESPACE CLIENT / CONNEXION */}
            <Link href="/espace-client" className={`flex items-center font-heading text-sm uppercase tracking-widest transition-colors hover:text-secondary ${isScrolled ? "text-primary/80" : "text-[#FAFAF7]"}`}>
              <User className="w-4 h-4 mr-2" /> Espace
            </Link>
            
            <Link href="/reservation" className={`ml-4 px-8 py-3 rounded-full font-body font-medium text-sm transition-all duration-300 ${isScrolled ? "bg-primary text-[#FAFAF7] hover:bg-primary/90" : "border border-[#FAFAF7] text-[#FAFAF7] bg-white/5 backdrop-blur-sm hover:bg-white/20"}`}>
              Réserver
            </Link>
          </nav>

          {/* Bouton Burger Mobile */}
          <button className="lg:hidden p-2 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className={`w-8 h-8 ${isScrolled || isMobileMenuOpen ? "text-primary" : "text-[#FAFAF7]"}`} /> : <Menu className={`w-8 h-8 ${isScrolled ? "text-primary" : "text-[#FAFAF7]"}`} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <div className={`fixed inset-0 bg-[#FAFAF7] z-40 transition-transform duration-500 ease-in-out lg:hidden flex flex-col pt-32 px-6 overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <nav className="flex flex-col items-center text-center w-full pb-20">
          
          {NAV_LINKS.map((item) => (
            <div key={item.name} className="w-full flex flex-col items-center mb-8">
              <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="font-heading text-2xl text-primary tracking-widest uppercase mb-2">
                {item.name}
              </Link>
              
              {/* Sous-liens visibles sur Mobile */}
              {item.subLinks && (
                <div className="flex flex-col space-y-4 mt-3">
                  {item.subLinks.map(sub => (
                    <Link 
                      key={sub.name} 
                      href={sub.href} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="font-heading text-[13px] text-primary/60 uppercase tracking-widest hover:text-secondary"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <button onClick={() => { setIsMobileMenuOpen(false); openOffers(); }} className="flex justify-center items-center font-heading text-2xl text-secondary tracking-widest uppercase mb-8">
            <Gift className="w-6 h-6 mr-3" /> Offres
          </button>

          {/* BOUTON ESPACE CLIENT MOBILE */}
          <Link href="/espace-client" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center font-heading text-2xl text-primary tracking-widest uppercase mb-8 hover:text-secondary">
            <User className="w-6 h-6 mr-3" /> Mon Espace
          </Link>

          <div className="pt-8 border-t border-primary/10 w-full max-w-xs">
            <Link href="/reservation" onClick={() => setIsMobileMenuOpen(false)} className="inline-block border-[3px] border-primary text-primary px-10 py-4 rounded-full font-body font-bold w-full hover:bg-primary hover:text-white transition-colors">
              Prendre RDV
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}