import Link from "next/link";
import { 
  LayoutDashboard, Calendar, Users, ListOrdered, 
  Clock, Star, Settings, LogOut, Tag, Award 
} from "lucide-react";
// 1. Importation de la fonction de déconnexion de NextAuth
import { signOut } from "@/auth"; 

const ADMIN_LINKS = [
  { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { name: "Planning & RDV", href: "/admin/calendrier", icon: Calendar },
  { name: "Disponibilités", href: "/admin/disponibilites", icon: Clock },
  { name: "Clients & Fidélité", href: "/admin/clients", icon: Award },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Prestations", href: "/admin/prestations", icon: Star },
  { name: "Paramètres", href: "/admin/parametres", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAFAF7] text-[#333333] font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-[#FAFAF7] flex flex-col shadow-xl hidden md:flex">
        <div className="h-24 flex items-center justify-center border-b border-[#FAFAF7]/10">
          <span className="font-heading text-3xl text-secondary font-black tracking-widest">WADA</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {ADMIN_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#FAFAF7]/10 transition-colors"
            >
              <link.icon className="w-5 h-5 mr-4 text-secondary" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-[#FAFAF7]/10">
          {/* 2. Le bouton est maintenant enveloppé dans un formulaire d'Action Serveur */}
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/connexion" });
          }}>
            <button type="submit" className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-xl transition-colors cursor-pointer">
              <LogOut className="w-5 h-5 mr-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}