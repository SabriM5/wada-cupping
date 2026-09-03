"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyToClipboard({ text, className = "" }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Évite de déclencher d'autres clics autour
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`focus:outline-none transition-colors p-1 ${className}`} 
      title="Copier le code"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}