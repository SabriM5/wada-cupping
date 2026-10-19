import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/app/globals.css"; // Contient @tailwind directives
import PopupWrapper from "@/components/layout/PopupWrapper"; 
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair' 
});
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: '--font-montserrat' 
});



export const metadata: Metadata = {
  metadataBase: new URL('https://www.wada-cupping.fr'),
  title: {
    default: 'Cupping Therapy à Domicile | WADA Sainte-Geneviève-des-Bois',
    template: '%s | WADA Cupping',
  },
  description: 'Séances de ventousothérapie sèche (Cupping Therapy) à domicile sur Sainte-Geneviève-des-Bois et en Île-de-France. Détente absolue, récupération et confort pelvien.',
  keywords: ['cupping therapy à domicile', 'ventousothérapie sèche', 'ventouses', 'bien-être', 'récupération sportive', 'Sainte-Geneviève-des-Bois', 'Essonne'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'WADA | Cupping Therapy à Domicile',
    description: 'L\'alliance du geste ancestral et du confort absolu. Prenez rendez-vous pour un rituel sur mesure à votre domicile.',
    url: 'https://www.wada-cupping.fr', // <-- CORRIGÉ
    siteName: 'WADA Cupping Therapy',
    images: [
      {
        url: '/images/page13-cta.webp', // Image plus esthétique pour le partage
        width: 1200,
        height: 630,
        alt: 'Rituel WADA Cupping Therapy',
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
        <LocalBusinessSchema /> {/* <-- AJOUT POUR LE RÉFÉRENCEMENT LOCAL */}
        <Header />
        <PopupWrapper />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
