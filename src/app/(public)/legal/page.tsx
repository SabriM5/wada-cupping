import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales & CGV | WADA",
  description: "Mentions légales et Conditions Générales de Vente des prestations WADA Cupping Therapy.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl text-primary font-bold mb-4 tracking-wide uppercase">
            Informations Légales
          </h1>
          <p className="font-body text-primary/60 text-lg">
            Mentions légales et Conditions Générales de Vente (CGV)
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-primary/10 font-body text-primary/80 leading-relaxed space-y-12">
          
          {/* SECTION 1 : MENTIONS LÉGALES */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6 pb-2 border-b border-primary/10">
              1. Mentions Légales
            </h2>
            
            <h3 className="font-bold text-primary mt-6 mb-2">Éditeur du site</h3>
            <p>
              Le site <strong>WADA Cupping Therapy</strong> est édité par :<br />
              <strong>Nom / Raison sociale :</strong> Amira Cherkit<br />
              <strong>Statut juridique :</strong> Entrepreneur individuel<br />
              <strong>SIRET :</strong> 884802075<br />
              <strong>Siège social :</strong> 10 AVENUE Louis Bréguet 78140 Vélizy-Villacoublay<br />
              <strong>Email :</strong> wada.cupping@gmail.com<br />
              <strong>Téléphone :</strong> 0760100216
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Hébergement</h3>
            <p>
              Ce site est hébergé par <strong>Vercel Inc.</strong><br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
              Site web : vercel.com
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Propriété Intellectuelle</h3>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          {/* SECTION 2 : CGV */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6 pb-2 border-b border-primary/10">
              2. Conditions Générales de Vente (CGV)
            </h2>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 1 : Objet et nature des prestations</h3>
            <p>
              Les présentes CGV s'appliquent à toutes les réservations de prestations de bien-être (Cupping therapy / Ventousothérapie) effectuées sur le site WADA. Ces prestations sont des soins de relaxation et de bien-être. <strong>Elles n'ont en aucun cas un but médical ou thérapeutique</strong> et ne remplacent pas une consultation chez un professionnel de santé.
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 2 : Réservation et Garantie Bancaire</h3>
            <p>
              Les réservations s'effectuent exclusivement en ligne. Pour confirmer définitivement le créneau à domicile, le client doit fournir une garantie bancaire via notre partenaire sécurisé <strong>Stripe</strong>. 
              Le client a le choix de régler l'intégralité du soin en ligne, ou de laisser une simple empreinte bancaire pour régler en espèces le jour de la prestation.
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 3 : Politique d'annulation et de retard</h3>
            <p>
              Par respect pour notre temps et notre organisation :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>L'annulation ou le report d'une séance est possible <strong>sans aucun frais jusqu'à 24 heures</strong> avant l'heure prévue.</li>
              <li>En cas d'annulation à <strong>moins de 24 heures</strong> du rendez-vous, une pénalité forfaitaire de <strong>20% du montant total du soin</strong> sera automatiquement prélevée sur la carte bancaire laissée en garantie.</li>
              <li>En cas de retard de plus de 20 minutes lors de l'arrivée au domicile, la praticienne se réserve le droit d'annuler la séance, entraînant l'application de la pénalité de 20%.</li>
            </ul>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 4 : Tarifs et Modalités de paiement</h3>
            <p>
              Les tarifs indiqués sur le site sont exprimés en euros (TTC). Les paiements sur place, à l'issue de la séance (si seule une empreinte a été laissée en ligne), s'effectuent <strong>exclusivement en espèces</strong>.
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 5 : Contre-indications</h3>
            <p>
              La Cupping Therapy est contre-indiquée pour les femmes enceintes (1er trimestre), les personnes souffrant de troubles circulatoires graves, ou présentant des plaies ouvertes. Il appartient au client de signaler tout problème de santé avant le début du soin.
            </p>

            <h3 className="font-bold text-primary mt-6 mb-2">Article 6 : Protection des données (RGPD)</h3>
            <p>
              Les données personnelles collectées lors de la réservation (nom, adresse, email, téléphone) sont strictement confidentielles et uniquement utilisées pour la gestion des rendez-vous et du programme de fidélité. Le client dispose d'un droit d'accès, de modification et de suppression de ses données depuis son Espace Client ou par simple e-mail.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}