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
    let channel: any;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Exécution en parallèle pour réduire le temps de chargement par deux
        const fetchProfile = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => { if (data) setProfile(data); });

        await Promise.all([fetchProfile, fetchOrders(user.id)]);

        // Abonnement Supabase Realtime pour rafraîchir la page automatiquement
        channel = supabase
          .channel(`realtime_user_orders_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'orders',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              console.log('Mise à jour de la commande détectée, rafraîchissement...');
              fetchOrders(user.id);
            }
          )
          .subscribe();
      }
      setLoading(false);
    };

    const fetchOrders = async (userId: string) => {
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (userOrders) setCourses(userOrders);
    };

    fetchData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

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
        
        {/* Stats Row & Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Link href="/commander" className="col-span-2 md:col-span-1 bg-sewa-red rounded-3xl p-4 md:p-6 shadow-sm border border-red-500 flex flex-col justify-center items-center text-center hover:bg-red-700 transition-colors group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Nouvelle Course</h3>
            <p className="text-[10px] md:text-xs text-white/80">Commander un livreur</p>
          </Link>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-green-100 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 relative z-10">{loading ? '...' : coursesLivrees}</h3>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider relative z-10">Livrées</p>
          </div>
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-red-100 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-3xl md:text-4xl font-black text-sewa-red mb-1 relative z-10">{loading ? '...' : coursesActives}</h3>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider relative z-10">En cours</p>
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
                      <div className="text-left sm:text-right flex items-center h-full">
                        <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${course.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
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
