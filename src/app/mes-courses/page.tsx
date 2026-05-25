'use client';
import { User, Settings, Eye, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MesCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Récupérer son profil
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (userProfile) setProfile(userProfile);

        // 3. Récupérer ses commandes
        const { data: userOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (userOrders) setCourses(userOrders);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const totalDepense = courses.reduce((acc, curr) => acc + Number(curr.price), 0);
  const coursesLivrees = courses.filter(c => c.status === 'delivered').length;
  const coursesActives = courses.filter(c => c.status !== 'delivered' && c.status !== 'cancelled').length;

  const translateStatus = (status: string) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'en_route': return 'En route';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 font-sans pb-20 md:pb-0 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        
        {/* Toggle Mode */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100 inline-flex overflow-x-auto max-w-full">
            <button className="px-4 md:px-6 py-2 rounded-full text-sewa-red font-bold text-xs flex items-center gap-2 bg-red-50 whitespace-nowrap transition-colors">
              <User className="w-4 h-4" /> ESPACE EXPÉDITEUR
            </button>
            <button className="px-4 md:px-6 py-2 rounded-full text-gray-500 font-medium text-xs flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap transition-colors">
              <Package className="w-4 h-4" /> MODE COURSIER
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="col-span-2 md:col-span-1 bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold tracking-wider mb-1 md:mb-2 uppercase">Compte dépensé</p>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : totalDepense.toLocaleString('fr-FR')} <span className="text-xs md:text-sm font-bold">GNF</span></h3>
            <p className="text-[10px] md:text-xs text-gray-400">Totalité des courses commandées</p>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-wider mb-1 md:mb-2 uppercase">Effectuées</p>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{loading ? '...' : coursesLivrees}</h3>
            <p className="text-[10px] md:text-xs text-gray-400">Livrées</p>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
            <p className="text-[10px] md:text-xs text-gray-400 font-bold tracking-wider mb-1 md:mb-2 uppercase">En cours</p>
            <h3 className="text-2xl md:text-3xl font-black text-sewa-red mb-1">{loading ? '...' : coursesActives}</h3>
            <p className="text-[10px] md:text-xs text-gray-400">Actives</p>
          </div>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Preferences Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-sewa-red" />
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Mes Préférences</h3>
            </div>
            
            {profile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Votre nom</label>
                  <input type="text" readOnly value={profile.full_name || ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Téléphone</label>
                  <input type="text" readOnly value={profile.phone || ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 font-medium outline-none transition-colors" />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center">Vous n'êtes pas connecté.</div>
            )}
          </div>

          {/* History List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 order-1 lg:order-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Historique d'expéditions</h3>
              <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">{courses.length} totales</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center text-gray-400 py-8 text-sm flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-sewa-red" /> Chargement...
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Aucune commande pour le moment.
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors gap-3 border border-transparent hover:border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">SEWA-{course.id.split('-')[0]}</span>
                        <span className="text-gray-400 text-xs truncate">→ {course.receiver_address?.name || 'Destinataire'}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 truncate w-48 sm:w-64">
                        {course.sender_address?.address} à {course.receiver_address?.address} • {course.distance} km
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-gray-900 text-sm mb-0.5">{Number(course.price).toLocaleString('fr-FR')} GNF</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${course.status === 'delivered' ? 'text-green-500' : 'text-orange-500'}`}>
                          {translateStatus(course.status)}
                        </p>
                      </div>
                      <Link href={`/suivi/${course.id}`} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-sewa-red hover:border-sewa-red transition-colors bg-white shrink-0 shadow-sm">
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
