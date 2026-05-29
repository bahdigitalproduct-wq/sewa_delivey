'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, CloudRain, Save, Loader2, Info } from 'lucide-react';

export default function ParametresAdmin() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    base_price: 15000,
    price_per_km: 2000,
    surge_multiplier: 1.0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const { error } = await supabase
      .from('app_settings')
      .update({
        base_price: settings.base_price,
        price_per_km: settings.price_per_km,
        surge_multiplier: settings.surge_multiplier,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-sewa-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-sewa-red" />
          God Mode : Tarification
        </h1>
        <p className="text-gray-500 font-medium mt-1">Ajustez le moteur de prix en temps réel pour toute l'application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prix standards */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Tarification de base
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Prix de base (GNF)</label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  value={settings.base_price}
                  onChange={(e) => setSettings({...settings, base_price: Number(e.target.value)})}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-lg font-bold rounded-2xl block w-full p-4 focus:ring-sewa-red focus:border-sewa-red outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Info className="w-3 h-3"/> Montant minimum d'une course</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Prix par Kilomètre (GNF)</label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  value={settings.price_per_km}
                  onChange={(e) => setSettings({...settings, price_per_km: Number(e.target.value)})}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-lg font-bold rounded-2xl block w-full p-4 focus:ring-sewa-red focus:border-sewa-red outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Surge Pricing / Météo */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Background effect if surge is active */}
          {settings.surge_multiplier > 1 && (
            <div className="absolute inset-0 bg-blue-50/50 pointer-events-none"></div>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
            <CloudRain className={`w-6 h-6 ${settings.surge_multiplier > 1 ? 'text-blue-500' : 'text-gray-400'}`} />
            Surge Pricing (Météo/Demande)
          </h2>

          <div className="relative z-10">
            <label className="block text-sm font-bold text-gray-700 mb-2">Multiplicateur de prix</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1"
                value={settings.surge_multiplier}
                onChange={(e) => setSettings({...settings, surge_multiplier: Number(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sewa-red"
              />
              <div className={`text-2xl font-black w-20 text-center rounded-xl py-2 ${settings.surge_multiplier > 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                x{settings.surge_multiplier}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
              <p className="text-sm text-yellow-800 font-medium">
                <strong>Attention :</strong> Un multiplicateur de x1.5 appliquera une hausse de 50% sur le calcul du prix de la distance pour toutes les nouvelles commandes. 
                Utile en cas de forte pluie à Conakry ou d'embouteillages exceptionnels.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
        </button>
      </div>

      {success && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-bounce z-50">
          ✅ Paramètres mis à jour avec succès !
        </div>
      )}
    </div>
  );
}
