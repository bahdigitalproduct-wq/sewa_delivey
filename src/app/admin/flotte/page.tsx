'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, UserPlus, Phone, Star, ShieldAlert, Loader2, Bike, X, CheckCircle2, MessageCircle, MapPin, Search, Filter } from 'lucide-react';

export default function FlotteAdmin() {
  const supabase = createClient();
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [riderToDelete, setRiderToDelete] = useState<string | null>(null);

  // États pour le formulaire de création
  const [newRiderNom, setNewRiderNom] = useState('');
  const [newRiderPrenom, setNewRiderPrenom] = useState('');
  const [newRiderTel, setNewRiderTel] = useState('');
  const [newRiderLieu, setNewRiderLieu] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchUsers = async () => {
    let query = supabase.from('coursiers').select('*').order('created_at', { ascending: false });
    
    if (filterLocation) {
      query = query.ilike('lieu_stationnement', `%${filterLocation}%`);
    }

    const { data: ridersData, error } = await query;
    
    if (error) {
      console.error("Erreur de récupération des coursiers:", error);
    } else if (ridersData) {
      setRiders(ridersData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [supabase, filterLocation]);

  const updateStatus = async (userId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from('coursiers').update({ statut: newStatus }).eq('id', userId);
    if (!error) {
      await fetchUsers();
    } else {
      alert("Erreur lors de la mise à jour du statut.");
      setLoading(false);
    }
  };

  const confirmDeleteRider = (userId: string) => {
    setRiderToDelete(userId);
  };

  const executeDeleteRider = async () => {
    if (!riderToDelete) return;
    setLoading(true);
    const { error } = await supabase.from('coursiers').delete().eq('id', riderToDelete);
    if (!error) {
      await fetchUsers();
    } else {
      alert("Erreur lors de la suppression.");
      setLoading(false);
    }
    setRiderToDelete(null);
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase.from('coursiers').insert([{
        nom: newRiderNom,
        prenom: newRiderPrenom,
        tel: newRiderTel,
        lieu_stationnement: newRiderLieu
      }]);

      if (error) throw error;

      setShowSuccessMessage(true);
      
      // Fermeture automatique
      setTimeout(async () => {
        await fetchUsers(); 
        setShowModal(false);
        setShowSuccessMessage(false);
        setNewRiderNom('');
        setNewRiderPrenom('');
        setNewRiderTel('');
        setNewRiderLieu('');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la création : " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-sewa-red" />
            Gestion de Flotte
          </h1>
          <p className="text-gray-500 font-medium mt-1">Supervisez les coursiers, leurs performances et leurs zones.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-sewa-red text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Ajouter un coursier
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filtrer par lieu de stationnement (ex: Lambanyi)" 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sewa-red focus:border-sewa-red outline-none transition-all bg-gray-50 hover:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-sewa-red" />
        </div>
      ) : (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Coursier</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Contact</th>
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
                        <p className="font-bold text-gray-900">{rider.prenom} {rider.nom}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 mb-2 ${rider.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {rider.statut || 'Actif'}
                        </span>
                        
                        <div className="mt-1 flex items-center gap-1 group/loc">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-bold text-gray-600">
                            {rider.lieu_stationnement || 'Non assigné'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {rider.tel}
                    </div>
                    {rider.tel && (
                      <div className="flex gap-2">
                         <a href={`tel:${rider.tel}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-200 transition-colors">
                           <Phone className="w-3 h-3" /> Appeler
                         </a>
                         <a href={`https://wa.me/${rider.tel.replace('+', '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-green-100 transition-colors">
                           <MessageCircle className="w-3 h-3" /> WhatsApp
                         </a>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right align-top">
                     <button onClick={() => confirmDeleteRider(rider.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Supprimer le coursier">
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {riders.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center flex flex-col items-center gap-2">
                    <Bike className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500 font-medium mt-2">Aucun coursier trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal d'ajout de coursier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Ajouter un coursier</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            {showSuccessMessage ? (
              <div className="p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Succès !</h3>
                <p className="text-gray-500 font-medium">Le coursier a été ajouté avec succès.</p>
                <div className="mt-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                </div>
              </div>
            ) : (
            <div className="p-6">
              <form onSubmit={handleCreateRider} className="space-y-5">
                <p className="text-sm text-gray-500 mb-2">Ajoutez un coursier à votre base de données pour l'assigner à des commandes.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Prénom</label>
                    <input required value={newRiderPrenom} onChange={e => setNewRiderPrenom(e.target.value)} type="text" placeholder="Ex: Mamadou" className="w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:border-sewa-red focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Nom</label>
                    <input required value={newRiderNom} onChange={e => setNewRiderNom(e.target.value)} type="text" placeholder="Ex: Diallo" className="w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:border-sewa-red focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Téléphone (WhatsApp)</label>
                  <input required value={newRiderTel} onChange={e => setNewRiderTel(e.target.value)} type="tel" placeholder="Ex: 620000000" className="w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:border-sewa-red focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm" />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Lieu de stationnement</label>
                  <input required value={newRiderLieu} onChange={e => setNewRiderLieu(e.target.value)} type="text" placeholder="Ex: Lambanyi, Kipé..." className="w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:border-sewa-red focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all shadow-sm" />
                </div>

                <button disabled={isCreating} type="submit" className="w-full bg-sewa-red text-white py-3.5 rounded-xl font-black text-base shadow-xl shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center justify-center mt-4 disabled:opacity-50 disabled:hover:translate-y-0">
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ajouter le coursier"}
                </button>
              </form>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {riderToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-sewa-red" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Supprimer le coursier ?</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Cette action est irréversible. Le coursier sera retiré de la base de données.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setRiderToDelete(null)} 
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={executeDeleteRider} 
                className="flex-1 bg-sewa-red text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
