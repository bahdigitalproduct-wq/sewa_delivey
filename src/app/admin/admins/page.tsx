'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ShieldAlert, Loader2, User, X, CheckCircle2 } from 'lucide-react';

export default function AdminsManagement() {
  const supabase = createClient();
  const [admins, setAdmins] = useState<any[]>([]);
  const [potentialAdmins, setPotentialAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    const { data: adminsData } = await supabase.from('profiles').select('*').eq('role', 'admin');
    // On permet à n'importe qui (user ou rider) de devenir admin
    const { data: usersData } = await supabase.from('profiles').select('*').neq('role', 'admin');
    
    if (adminsData) setAdmins(adminsData);
    if (usersData) setPotentialAdmins(usersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const updateRole = async (userId: string, newRole: 'user' | 'admin') => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      await fetchUsers();
      if (newRole === 'admin') setShowModal(false);
    } else {
      alert("Erreur lors de la mise à jour du rôle.");
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
            <ShieldCheck className="w-8 h-8 text-sewa-red" />
            Sécurité & Accès
          </h1>
          <p className="text-gray-500 font-medium mt-1">Gérez qui a accès au tableau de bord administrateur (God Mode).</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-sewa-red text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Nommer un Administrateur
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Administrateur</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-sewa-red" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{admin.full_name || 'Admin Anonyme'}</p>
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                          God Mode
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                      {admin.phone || 'Non renseigné'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => updateRole(admin.id, 'user')} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Retirer les droits d'administration">
                      <ShieldAlert className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {admins.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center flex flex-col items-center gap-2">
                    <ShieldCheck className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500 font-medium mt-2">Aucun administrateur trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Ajouter un accès Admin</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Sélectionnez un utilisateur pour lui donner les droits totaux d'administration sur la plateforme.</p>
              
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {potentialAdmins.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:border-sewa-red/30 transition-colors">
                    <div>
                      <p className="font-bold text-gray-900">{user.full_name || 'Utilisateur Anonyme'}</p>
                      <p className="text-xs text-gray-500">{user.phone || 'Pas de numéro'} • Rôle: {user.role}</p>
                    </div>
                    <button 
                      onClick={() => updateRole(user.id, 'admin')}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-sewa-red flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Nommer Admin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
