import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/app/globals.css"; // Contient @tailwind directives
import PopupWrapper from "@/components/layout/PopupWrapper"; 

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair' 
});
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: '--font-montserrat' 
});


// Supprime l'ancienne ligne : export const metadataBase = ...

export const metadata: Metadata = {
  metadataBase: new URL('https://www.wada-cupping.fr'), // Ton vrai nom de domaine
  
  title: {
    default: 'Hijama & Cupping Therapy à Domicile | Sainte-Geneviève-des-Bois',
    template: '%s | Cupping Therapy', 
  },
  description: 'Séances de hijama (ventouses sèches et humides) à domicile sur Sainte-Geneviève-des-Bois et en Île-de-France. Détente, récupération et hygiène stricte.',
  keywords: ['hijama à domicile', 'cupping therapy', 'ventouses', 'bien-être', 'récupération sportive', 'Sainte-Geneviève-des-Bois', 'Essonne'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hijama & Cupping Therapy à Domicile',
    description: 'Offrez-vous un moment de détente absolue sans quitter votre confort. Cupping therapy à domicile avec un protocole d\'hygiène rigoureux.',
    url: 'https://www.ton-domaine.fr',
    siteName: 'Cupping Therapy',
    images: [
      {
        url: '/images/og-image.jpg', // Une image élégante tirée du Canva
        width: 1200,
        height: 630,
        alt: 'Matériel de cupping therapy premium',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hijama & Cupping Therapy à Domicile',
    description: 'Séances de bien-être par ventouses à domicile.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
        <body className="font-body bg-background text-text antialiased min-h-screen flex flex-col">
        <Header />
        <PopupWrapper /> {/* <-- LE POP-UP EST ICI (Il remplace AnnouncementBanner) */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
