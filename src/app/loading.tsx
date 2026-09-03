export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
      {/* Spinner premium, fin et élégant */}
      <div className="w-12 h-12 border-2 border-surface border-t-secondary rounded-full animate-spin"></div>
      <p className="mt-4 font-body text-sm text-muted uppercase tracking-widest">Chargement...</p>
    </div>
  );
}