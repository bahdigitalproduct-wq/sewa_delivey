'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, Phone, Star, ShieldAlert, Loader2, Bike, X, CheckCircle2, MessageCircle, MapPin, Check, Edit2 } from 'lucide-react';

export default function FlotteAdmin() {
  const supabase = createClient();
  const [riders, setRiders] = useState<any[]>([]);
  const [potentialRiders, setPotentialRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [tempLocation, setTempLocation] = useState<string>('');

  const fetchUsers = async () => {
    const { data: ridersData } = await supabase.from('profiles').select('*').eq('role', 'rider');
    const { data: usersData } = await supabase.from('profiles').select('*').eq('role', 'user');
    
    if (ridersData) setRiders(ridersData);
    if (usersData) setPotentialRiders(usersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const updateRole = async (userId: string, newRole: 'user' | 'rider') => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      await fetchUsers();
      if (newRole === 'rider') setShowModal(false);
    } else {
      alert("Erreur lors de la mise à jour du rôle.");
      setLoading(false);
    }
  };

  const updateLocation = async (userId: string) => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ base_location: tempLocation }).eq('id', userId);
    if (!error) {
      setEditingLocationId(null);
      await fetchUsers();
    } else {
      alert("Erreur lors de la mise à jour de la localisation.");
      setLoading(false);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-sewa-red" />
            Gestion de Flotte
          </h1>
          <p className="text-gray-500 font-medium mt-1">Supervisez les coursiers, leurs performances et accès.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-sewa-red text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Ajouter un coursier
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Coursier</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Performance</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                        <Bike className="w-5 h-5 text-sewa-red" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{rider.full_name || 'Coursier Anonyme'}</p>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 mb-2">
                          Autorisé
                        </span>
                        
                        {/* Lieu de Stationnement */}
                        <div className="mt-1">
                          {editingLocationId === rider.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="text" 
                                value={tempLocation} 
                                onChange={(e) => setTempLocation(e.target.value)} 
                                placeholder="Ex: Lambanyi" 
                                className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-sewa-red"
                                autoFocus
                              />
                              <button onClick={() => updateLocation(rider.id)} className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={() => setEditingLocationId(null)} className="bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 group/loc">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-bold text-gray-600">
                                {rider.base_location || 'Non assigné'}
                              </span>
                              <button onClick={() => { setEditingLocationId(rider.id); setTempLocation(rider.base_location || ''); }} className="opacity-0 group-hover/loc:opacity-100 p-1 text-gray-400 hover:text-sewa-red transition-all">
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {rider.phone || 'Non renseigné'}
                    </div>
                    {rider.phone && (
                      <div className="flex gap-2">
                         <a href={`tel:${rider.phone}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-200 transition-colors">
                           <Phone className="w-3 h-3" /> Appeler
                         </a>
                         <a href={`https://wa.me/${rider.phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-green-100 transition-colors">
                           <MessageCircle className="w-3 h-3" /> WhatsApp
                         </a>
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-gray-400 font-bold text-sm">
                        <Star className="w-4 h-4" /> <span className="text-xs">Nouveau</span>
                      </div>
                      <div className="text-sm font-bold text-gray-500">
                        0 course
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right align-top">
                    <button onClick={() => updateRole(rider.id, 'user')} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Rétrograder en utilisateur normal">
                      <ShieldAlert className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {riders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center flex flex-col items-center gap-2">
                    <Bike className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500 font-medium mt-2">Aucun coursier n'est actuellement enregistré avec le rôle "rider".</p>
                    <p className="text-xs text-gray-400">Cliquez sur "Ajouter un coursier" pour promouvoir un utilisateur existant.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de coursier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Promouvoir un coursier</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Sélectionnez un utilisateur existant pour le promouvoir au rang de coursier. Seuls les comptes standards apparaissent ici.</p>
              
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {potentialRiders.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:border-sewa-red/30 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{user.full_name || 'Utilisateur Anonyme'}</p>
                      <p className="text-xs text-gray-500">{user.phone || 'Pas de numéro'}</p>
                    </div>
                    <button 
                      onClick={() => updateRole(user.id, 'rider')}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-sewa-red flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Promouvoir
                    </button>
                  </div>
                ))}
                
                {potentialRiders.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm font-medium">Aucun utilisateur standard trouvé.</p>
                    <p className="text-xs text-gray-400 mt-1">Créez d'abord un compte via l'application cliente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
