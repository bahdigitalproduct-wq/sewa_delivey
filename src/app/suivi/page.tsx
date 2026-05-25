'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export default function SuiviIndexPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/suivi/${orderId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 text-sewa-red rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          Suivre un colis
        </h2>
        <p className="text-gray-500 mb-8">
          Entrez le numéro de votre commande (ex: 550e8400-e29b...)
        </p>

        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ID de la commande"
              className="block w-full pl-11 pr-4 py-4 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-sewa-red text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md shadow-red-500/20"
          >
            Rechercher <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
