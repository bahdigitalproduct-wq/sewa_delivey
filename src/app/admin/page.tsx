'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PackageSearch, DollarSign, Activity, Users, Clock, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SuperDashboard() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [ridersCount, setRidersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [ordersRes, ridersRes] = await Promise.all([
          supabase.from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500), // Limite intelligente pour chargement instantané
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'rider')
        ]);
        
        if (!isMounted) return;

        if (ordersRes.data) setOrders(ordersRes.data);
        if (ridersRes.count !== null) setRidersCount(ridersRes.count);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();

    // Abonnement aux changements de la base de données
    const channel = supabase
      .channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []); // Retrait de supabase des dépendances pour éviter les boucles infinies

  const exportCSV = () => {
    if (orders.length === 0) return alert("Aucune commande à exporter.");
    const headers = ['ID', 'Date', 'Statut', 'Prix (GNF)', 'Distance (km)'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleString('fr-FR'),
      o.status,
      o.price || 0,
      o.distance || 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_sewa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-sewa-red" />
      </div>
    );
  }

  // Stats du jour
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
  const totalRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  // Calcul de données réelles pour le graphique sur 7 jours
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const count = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === dateStr).length;
      data.push(count);
    }
    return data;
  };

  const chartData = getLast7DaysData();
  const maxVal = Math.max(...chartData, 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vue Globale</h1>
          <p className="text-gray-500 font-medium mt-1">L'activité de Sewa Delivery en temps réel.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
            Exporter CSV
          </button>
          <Link href="/admin/radar" className="bg-sewa-red text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live Radar
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gray-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <PackageSearch className="w-6 h-6 text-gray-700" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/> +12%</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">{todayOrders.length}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Courses (Auj.)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-lg">GNF</span></h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">CA Réalisé (Auj.)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            {pendingOrders.length > 0 && (
              <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">Action requise</span>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">{pendingOrders.length}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">En attente d'assignation</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-gray-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900">{ridersCount}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Livreurs Actifs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique d'activité avec Tailwind pur */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Activité de la semaine</h2>
              <p className="text-sm text-gray-500">Volume de courses sur les 7 derniers jours</p>
            </div>
            <select className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer">
              <option>Cette semaine</option>
              <option>Ce mois</option>
            </select>
          </div>
          
          <div className="h-64 relative flex items-end justify-between px-2 pt-10 pb-6 mt-4 bg-gray-50/50 rounded-2xl border border-gray-100 overflow-visible">
            {/* Lignes de repère (Grid Lines) */}
            <div className="absolute inset-0 flex flex-col justify-between pb-10 pointer-events-none px-4 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-t border-gray-200 border-dashed opacity-50 relative">
                  {i === 0 && <span className="absolute -top-3 -left-2 text-[10px] font-bold text-gray-300">{maxVal}</span>}
                  {i === 4 && <span className="absolute -top-3 -left-2 text-[10px] font-bold text-gray-300">0</span>}
                </div>
              ))}
            </div>
            
            {/* Barres du graphique */}
            {chartData.map((val, idx) => (
              <div key={idx} className="w-full flex flex-col items-center justify-end h-full relative z-10 group cursor-pointer">
                <div className="w-full max-w-[48px] h-full flex items-end justify-center px-1">
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${Math.max((val / maxVal) * 100, 8)}%`, opacity: 1 }}
                    transition={{ duration: 0.8, delay: idx * 0.1, type: "spring", stiffness: 60 }}
                    className={`w-full rounded-t-xl relative transition-all duration-300 shadow-sm ${
                      idx === 6 
                        ? 'bg-gradient-to-t from-red-600 to-sewa-red shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:brightness-110' 
                        : 'bg-gradient-to-t from-red-100 to-red-300 group-hover:from-red-200 group-hover:to-red-400'
                    }`}
                  >
                    {/* Infobulle premium */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-black py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 whitespace-nowrap shadow-2xl pointer-events-none flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{idx === 6 ? "Aujourd'hui" : `Il y a ${6-idx} jour${6-idx > 1 ? 's' : ''}`}</span>
                      {val} course{val > 1 ? 's' : ''}
                      {/* Flèche de l'infobulle */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </motion.div>
                </div>
                {/* Labels de l'Axe X */}
                <span className={`absolute -bottom-6 text-[11px] font-black tracking-wider ${idx === 6 ? 'text-sewa-red bg-red-50 px-2 py-0.5 rounded-md' : 'text-gray-400'}`}>
                  {idx === 6 ? "AUJ." : `J-${6-idx}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Commandes Récentes */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Commandes Récentes</h2>
            <Link href="/admin/radar" className="text-sm text-sewa-red font-bold hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-orange-500 animate-pulse' : order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[150px]">
                      To: {order.receiver_address?.address?.split(',')[0] || 'Adresse inconnue'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--:--'} • {Number(order.price || 0).toLocaleString('fr-FR')} GNF
                    </p>
                  </div>
                </div>
                <Link href={`/suivi/${order.id}`} className="bg-gray-100 p-2 rounded-xl text-gray-600 hover:bg-gray-200 cursor-pointer">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune commande pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
