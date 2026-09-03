"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="font-heading text-3xl text-primary mb-4">Oups, une erreur est survenue</h2>
      <p className="font-body text-muted mb-8 max-w-md">Nous n'avons pas pu charger cette page. Veuillez vérifier votre connexion ou réessayer.</p>
      <button 
        onClick={() => reset()}
        className="bg-secondary text-surface px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
      >
        Réessayer
      </button>
    </div>
  );
}