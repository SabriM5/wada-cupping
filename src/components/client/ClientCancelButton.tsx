"use client";
import { XCircle } from "lucide-react";

export default function ClientCancelButton({ message }: { message: string }) {
  return (
    <button
       type="submit"
       onClick={(e) => {
        if(!window.confirm(message)) {
          e.preventDefault();
        }
      }}
      className="mt-4 md:mt-0 md:ml-4 px-6 py-2 bg-white border border-red-200 text-red-500 rounded-full font-body font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors flex items-center"
    >
      <XCircle className="w-4 h-4 mr-2" /> Annuler mon RDV
    </button>
  );
}