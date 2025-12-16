import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Success() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center border border-purple-500/20">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">Paiement réussi ! 🎉</h1>
        <p className="text-slate-300 mb-6">
          Merci pour votre achat ! Vous allez recevoir un email avec le lien de téléchargement dans quelques instants.
        </p>
        <p className="text-sm text-slate-400 mb-6">
          Vérifiez aussi vos spams si vous ne voyez pas l'email.
        </p>
        
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}