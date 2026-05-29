'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Map as MapIcon, Navigation2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import dynamique pour éviter l'erreur "window is not defined" de Leaflet
const LiveRadarMap = dynamic(() => import('@/components/admin/LiveRadarMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center rounded-3xl border border-gray-200">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

export default function RadarPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();

    // Abonnement Realtime pour la carte !
    const channel = supabase
      .channel('admin_radar_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) alert("Erreur lors de la mise à jour du statut.");
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <MapIcon className="w-8 h-8 text-sewa-red" />
          Live Radar
        </h1>
        <p className="text-gray-500 font-medium mt-1">Supervisez la flotte et les commandes en temps réel sur la carte.</p>
      </div>

      <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 overflow-hidden relative">
        {/* Carte Leaflet */}
        <div className="flex-1 h-full rounded-2xl overflow-hidden relative z-0 border border-gray-200">
          {!loading && <LiveRadarMap orders={activeOrders} />}
          
          <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50"></div>
               <span className="text-xs font-bold text-gray-700">En attente ({activeOrders.filter(o=>o.status==='pending').length})</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></div>
               <span className="text-xs font-bold text-gray-700">En cours ({activeOrders.filter(o=>o.status==='en_route').length})</span>
             </div>
          </div>
        </div>

        {/* Panneau latéral des courses actives */}
        <div className="w-80 h-full overflow-y-auto bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hidden lg:block">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation2 className="w-4 h-4 text-sewa-red" />
            Courses actives ({activeOrders.length})
          </h3>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <div key={order.id} className="block bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-sewa-red/30 transition-colors relative">
                <div className="flex justify-between items-center mb-3">
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`text-[10px] font-bold uppercase px-2 py-1.5 rounded-md cursor-pointer outline-none border-none appearance-none ${
                      order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                      order.status === 'en_route' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="pending">⏳ En attente</option>
                    <option value="confirmed">✅ Confirmé</option>
                    <option value="en_route">🏍️ En route</option>
                    <option value="delivered">📦 Livré</option>
                    <option value="cancelled">❌ Annulé</option>
                  </select>
                  <Link href={`/suivi/${order.id}`} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors font-bold">
                    Détails
                  </Link>
                </div>
                <div className="mb-1 flex justify-between items-end">
                   <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.receiver_address.address}</p>
                   <span className="text-xs font-bold text-gray-900 whitespace-nowrap ml-2">{Number(order.price).toLocaleString('fr-FR')} GNF</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">De: {order.sender_address.address}</p>
              </div>
            ))}
            {activeOrders.length === 0 && !loading && (
              <p className="text-xs text-center text-gray-500 py-4 font-medium">Aucune course active actuellement.</p>
            )}
            {loading && (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
