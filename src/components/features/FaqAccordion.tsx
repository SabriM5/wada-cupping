"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { 
    question: "La ventousothérapie sèche est-elle douloureuse ?", 
    answer: "Non, la séance est conçue pour être agréable et enveloppante. La pose des ventouses crée une aspiration douce et réglable selon votre sensibilité. La sensation ressemble à un massage étiré en profondeur, idéal pour relâcher les tensions musculaires." 
  },
  { 
    question: "La séance laisse-t-elle des marques sur la peau ?", 
    answer: "La ventousothérapie sèche peut entraîner l'apparition de marques circulaires temporaires (échymoses de surface) liées à la vascularisation de la zone travaillée. Ces marques sont indolores et s'estompent naturellement en quelques jours." 
  },
  { 
    question: "Comment se déroule l'installation à mon domicile ?", 
    answer: "Il vous suffit de prévoir un espace suffisant pour accueillir la table de massage. Nous apportons l'intégralité du matériel professionnel, du linge propre et des équipements de soin." 
  },
  { 
    question: "Y a-t-il des contre-indications à prendre en compte ?", 
    answer: "Par mesure de précaution, la ventousothérapie sèche est déconseillée en cas de troubles circulatoires majeurs, sur des plaies ouvertes ou lésions cutanées, ainsi que durant le premier trimestre de grossesse. Un questionnaire préalable permet de valider la faisabilité du soin." 
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      {FAQS.map((faq, index) => (
        <div key={index} className="border-b border-primary/20 overflow-hidden">
          <button 
            onClick={() => setOpenIndex(openIndex === index ? null : index)} 
            className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
          >
            <span className="font-heading text-xl md:text-2xl font-bold text-primary group-hover:text-secondary transition-colors">
              {faq.question}
            </span>
            <ChevronDown className={`w-6 h-6 text-primary transition-transform duration-300 flex-shrink-0 ml-4 ${openIndex === index ? "rotate-180" : ""}`} />
          </button>
          <div className={`transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-60 opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
            <p className="font-heading text-primary/80 text-lg leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}