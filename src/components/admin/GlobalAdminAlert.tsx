'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Fonction pour jouer un son de notification
const playNotificationSound = async () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    // Les navigateurs bloquent souvent l'audio s'il n'y a pas eu d'interaction
    // On force le réveil du contexte
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    
    const playDing = (delay: number, freq: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle'; // Son plus doux que 'sine' mais plus présent
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + delay + 0.05); // Plus fort (0.5 au lieu de 0.3)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.6);
    };

    // Joue un "Ding-Dong" ascendant
    playDing(0, 880); // La5
    playDing(0.15, 1108.73); // Do#6
    
  } catch (e) {
    console.error("Audio bloqué par le navigateur", e);
  }
};

export default function GlobalAdminAlert() {
  const supabase = createClient();
  const [newOrders, setNewOrders] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('global_admin_orders_alert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        // 1. Jouer le son
        playNotificationSound();
        
        // 2. Ajouter l'alerte visuelle
        setNewOrders(prev => [...prev, payload.new]);
        
        // 3. Auto-fermer la notif après 12 secondes
        setTimeout(() => {
          setNewOrders(prev => prev.filter(o => o.id !== payload.new.id));
        }, 12000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const removeAlert = (id: string) => {
    setNewOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {newOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border-l-4 border-sewa-red flex items-start gap-4 min-w-[320px] pointer-events-auto"
          >
            <div className="bg-red-50 p-3 rounded-full animate-pulse">
              <BellRing className="w-6 h-6 text-sewa-red" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-gray-900">Nouvelle Commande !</h4>
              <p className="text-sm font-medium text-gray-600 mt-1 line-clamp-1">{order.receiver_address?.address || "Adresse non spécifiée"}</p>
              <div className="flex items-center gap-3 mt-3">
                <Link href={`/suivi/${order.id}`} className="text-xs bg-gray-900 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-sewa-red transition-colors">
                  Détails
                </Link>
                <span className="text-xs font-bold text-sewa-red">{Number(order.price).toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
            <button onClick={() => removeAlert(order.id)} className="text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
