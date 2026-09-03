export default function LocalBusinessSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "WADA Cupping Therapy",
    "image": "https://www.wada-cupping.fr/images/logo.png",
    "@id": "https://www.wada-cupping.fr",
    "url": "https://www.wada-cupping.fr",
    "telephone": "+33760100216", // <-- REMPLACE PAR LE VRAI NUMÉRO D'AMIRA
    "priceRange": "70€ - 110€",
    "description": "Praticienne experte en ventousothérapie (Cupping Therapy) se déplaçant à votre domicile en Île-de-France pour des séances de bien-être, récupération sportive et confort pelvien.",
    "areaServed": [
      { "@type": "City", "name": "Sainte-Geneviève-des-Bois" },
      { "@type": "State", "name": "Île-de-France" }
    ],
    "makesOffer": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Rituel Décompression & Récupération" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Rituel Glow & Lift Facial" } }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}