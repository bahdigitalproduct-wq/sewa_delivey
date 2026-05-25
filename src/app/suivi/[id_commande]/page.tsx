'use client';
import { ArrowLeft, Phone, MessageCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function TrackingPage() {
  const params = useParams();
  const id_commande = params.id_commande as string;
  const driverPhone = "+224624816383";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!id_commande) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id_commande)
        .single();
      
      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Abonnement Supabase Realtime
    const channel = supabase
      .channel(`realtime_order_${id_commande}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id_commande}`
        },
        (payload) => {
          console.log('Update reçu en temps réel:', payload);
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id_commande, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-sewa-red" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-xl font-bold text-gray-900 mb-4">Commande introuvable</p>
        <Link href="/" className="px-6 py-3 bg-sewa-red text-white rounded-2xl font-bold hover:bg-red-700 transition-colors">Retour à l'accueil</Link>
      </div>
    );
  }

  const getStatusText = () => {
    switch(order.status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'en_route': return 'En route';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = () => {
    if (order.status === 'delivered') return 'bg-green-500';
    if (order.status === 'cancelled') return 'bg-red-500';
    return 'bg-sewa-red';
  };

  // Logique pour la timeline
  const orderIndex = ['pending', 'confirmed', 'en_route', 'delivered'].indexOf(order.status);
  const isPastOrCurrent = (stepStatus: string) => {
    const stepIndex = ['pending', 'confirmed', 'en_route', 'delivered'].indexOf(stepStatus);
    return stepIndex <= orderIndex || order.status === 'delivered';
  };
  const isCurrent = (stepStatus: string) => order.status === stepStatus;

  const handleUpdateStatus = async (newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    if (error) alert("Erreur de mise à jour");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-gray-50 pb-20 md:pb-0 overflow-hidden min-h-screen">
      
      {/* Map Section (Top on mobile, Left on desktop) */}
      <div className="h-[45vh] md:h-auto md:flex-1 relative z-0">
        <MapComponent 
          pickup={{ lat: 9.5375, lng: -13.6771 }} 
          delivery={{ lat: 9.6, lng: -13.62 }} 
          driver={{ lat: 9.56, lng: -13.65 }} 
        />
        <div className="absolute top-4 left-4 z-[400] md:hidden">
          <Link href="/commander" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
        <div className="absolute top-4 right-4 z-[400] bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-md">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${order.status !== 'delivered' && order.status !== 'cancelled' ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-bold text-gray-800">{getStatusText()}</span>
        </div>
      </div>
      
      {/* Info Section (Bottom on mobile, Right on desktop) */}
      <div className="flex-1 md:w-[450px] md:flex-none bg-white md:shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-10 flex flex-col overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Commande N°</p>
              <p className="text-lg md:text-xl font-black text-gray-900 truncate w-32 md:w-48" title={order.id}>{order.id.split('-')[0]}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-lg md:text-xl font-black text-sewa-red">{Number(order.price).toLocaleString('fr-FR')} GNF</p>
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sewa-red rounded-full flex items-center justify-center text-white shrink-0">
                <span className="font-bold">AI</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">Aissatou Camara</h4>
                <p className="text-xs text-yellow-500 font-medium flex items-center gap-1">★ 5.0 <span className="text-gray-400 font-normal">- moto</span></p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`tel:${driverPhone}`} className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${driverPhone.replace('+','')}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md shadow-green-500/20 hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-3 mb-6 space-y-4">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>
            
            <div className={`flex items-center gap-4 ${!isPastOrCurrent('pending') ? 'opacity-30' : (isCurrent('pending') ? '' : 'opacity-50')}`}>
              <div className={`shrink-0 rounded-full ${isCurrent('pending') ? 'w-3 h-3 bg-sewa-red border-4 border-red-100 -ml-[1px]' : 'w-2.5 h-2.5 bg-sewa-red'}`}></div>
              <span className="text-sm font-bold text-gray-900">En attente de confirmation</span>
            </div>
            
            <div className={`flex items-center gap-4 ${!isPastOrCurrent('confirmed') ? 'opacity-30' : (isCurrent('confirmed') ? '' : 'opacity-50')}`}>
              <div className={`shrink-0 rounded-full ${isCurrent('confirmed') ? 'w-3 h-3 bg-sewa-red border-4 border-red-100 -ml-[1px]' : 'w-2.5 h-2.5 bg-sewa-red'}`}></div>
              <span className="text-sm font-bold text-gray-900">Commande confirmée</span>
            </div>
            
            <div className={`flex items-center gap-4 ${!isPastOrCurrent('en_route') ? 'opacity-30' : (isCurrent('en_route') ? '' : 'opacity-50')}`}>
              <div className={`shrink-0 rounded-full ${isCurrent('en_route') ? 'w-3 h-3 bg-sewa-red border-4 border-red-100 -ml-[1px]' : 'w-2.5 h-2.5 bg-sewa-red'}`}></div>
              <span className="text-sm font-bold text-gray-900">En route vers le destinataire</span>
            </div>
            
            <div className={`flex items-center gap-4 ${!isPastOrCurrent('delivered') ? 'opacity-30' : ''}`}>
              <div className={`shrink-0 rounded-full ${isCurrent('delivered') ? 'w-3 h-3 bg-green-500 border-4 border-green-100 -ml-[1px]' : 'w-2.5 h-2.5 ' + (order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200')}`}></div>
              <span className={`text-sm ${order.status === 'delivered' ? 'font-bold text-green-600' : 'text-gray-400'}`}>Livré</span>
            </div>
          </div>

          {/* Addresses Detail */}
          <div className="bg-orange-50/50 rounded-2xl p-4 mb-6">
            <div className="text-xs text-gray-600 space-y-2">
              <p className="truncate"><span className="text-gray-400">Expéditeur :</span> {order.sender_address?.name} ({order.sender_address?.phone})</p>
              <p className="truncate"><span className="text-gray-400">Retrait :</span> {order.sender_address?.address}</p>
              <div className="h-px bg-orange-200/50 my-2"></div>
              <p className="truncate"><span className="text-gray-400">Receveur :</span> {order.receiver_address?.name} ({order.receiver_address?.phone})</p>
              <p className="truncate"><span className="text-gray-400">Livraison :</span> {order.receiver_address?.address}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {order.status === 'pending' && (
              <button onClick={() => handleUpdateStatus('confirmed')} className="flex-1 bg-gray-900 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold hover:bg-gray-800 transition-colors">
                Accepter (Test)
              </button>
            )}
            {order.status === 'confirmed' && (
              <button onClick={() => handleUpdateStatus('en_route')} className="flex-1 bg-blue-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold hover:bg-blue-600 transition-colors">
                Mettre en route (Test)
              </button>
            )}
            {order.status === 'en_route' && (
              <button onClick={() => handleUpdateStatus('delivered')} className="flex-1 bg-green-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-md shadow-green-500/20 hover:bg-green-600 transition-colors">
                <CheckCircle2 className="w-5 h-5" /> Colis reçu
              </button>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button onClick={() => handleUpdateStatus('cancelled')} className="flex-1 bg-white border border-gray-200 text-red-500 rounded-xl py-3 flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-colors">
                <X className="w-5 h-5" /> Annuler (Test)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
