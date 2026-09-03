"use client";
import { AlertTriangle } from "lucide-react";

export default function CancelPenaltyButton({ penaltyPercent = 20 }: { penaltyPercent?: number }) {
  return (
    <button
       type="submit"
       onClick={(e) => {
        if(!window.confirm(`Êtes-vous sûr de vouloir annuler ce RDV et débiter automatiquement la pénalité de ${penaltyPercent}% sur la carte de la cliente ?`)) {
          e.preventDefault();
        }
      }}
      className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl font-body font-bold text-[11px] uppercase tracking-wider hover:bg-red-100 transition flex items-center justify-center"
    >
      <AlertTriangle className="w-4 h-4 mr-2" /> Annuler & Débiter ({penaltyPercent}%)
    </button>
  );
}