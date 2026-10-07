"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Users, ListOrdered, 
  Clock, Star, Settings, LogOut, Tag, Award, Gift, Menu, X 
} from "lucide-react";

// On utilise le signOut côté client car ce composant est maintenant interactif
import { signOut } from "next-auth/react";

const ADMIN_LINKS = [
  { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { name: "Planning & RDV", href: "/admin/calendrier", icon: Calendar },
  { name: "Disponibilités", href: "/admin/disponibilites", icon: Clock },
  { name: "Clients & Fidélité", href: "/admin/clients", icon: Award },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Bons Cadeaux", href: "/admin/cadeaux", icon: Gift },
  { name: "Prestations", href: "/admin/prestations", icon: Star },
  { name: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#FAFAF7] text-[#333333] font-body overflow-hidden">
      
      {/* HEADER MOBILE (Visible uniquement sur petit écran) */}
      <div className="md:hidden bg-primary text-[#FAFAF7] p-4 flex justify-between items-center fixed top-0 w-full z-40 shadow-md">
        <span className="font-heading text-xl text-secondary font-black tracking-widest">WADA ADMIN</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-7 h-7 text-secondary" /> : <Menu className="w-7 h-7 text-secondary" />}
        </button>
      </div>

      {/* OVERLAY SOMBRE MOBILE (Ferme le menu si on clique à côté) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR (Rétractable sur mobile, fixe sur PC) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary text-[#FAFAF7] flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-20 md:h-24 flex items-center justify-center border-b border-[#FAFAF7]/10 mt-12 md:mt-0">
          <span className="font-heading text-2xl md:text-3xl text-secondary font-black tracking-widest">WADA</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Ferme le menu au clic sur mobile
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? "bg-secondary text-primary shadow-sm" : "hover:bg-[#FAFAF7]/10"
                }`}
              >
                <link.icon className={`w-5 h-5 mr-4 ${isActive ? "text-primary" : "text-secondary"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#FAFAF7]/10">
          <button 
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}