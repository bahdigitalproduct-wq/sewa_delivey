'use client';

import { ArrowLeft, MapPin, Navigation, Package, Wallet, CreditCard, Banknote, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Zod Schema
const orderSchema = z.object({
  pickup_address: z.string().min(3, "L'adresse de retrait est requise"),
  delivery_address: z.string().min(3, "L'adresse de livraison est requise"),
  package_description: z.string().optional(),
  sender_name: z.string().min(2, "Le nom est requis"),
  sender_phone: z.string().min(8, "Numéro invalide"),
  receiver_name: z.string().min(2, "Le nom est requis"),
  receiver_phone: z.string().min(8, "Numéro invalide"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function CommanderPage() {
  const router = useRouter();
  const supabase = createClient();
  const [distance, setDistance] = useState(5);
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'vip'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'orange_money' | 'mobile_money'>('cash');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema)
  });

  const basePrice = 10000;
  const pricePerKm = 1000;
  
  let urgencyMultiplier = 1;
  if (urgency === 'express') urgencyMultiplier = 1.5;
  if (urgency === 'vip') urgencyMultiplier = 2;

  const totalPrice = Math.round((basePrice + (distance * pricePerKm)) * urgencyMultiplier);

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          setValue('pickup_address', `Ma position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          setIsLocating(false);
          setLocationError("Impossible de récupérer la position.");
        }
      );
    } else {
      setIsLocating(false);
      setLocationError("Géolocalisation non supportée.");
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const sender_address = {
        address: data.pickup_address,
        name: data.sender_name,
        phone: data.sender_phone
      };

      const receiver_address = {
        address: data.delivery_address,
        name: data.receiver_name,
        phone: data.receiver_phone,
        description: data.package_description || ""
      };

      const { data: insertedOrder, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        sender_address,
        receiver_address,
        price: totalPrice,
        distance,
        status: 'pending',
        urgency,
        payment_method: paymentMethod
      }).select().single();

      if (error) throw error;

      router.push(`/suivi/${insertedOrder.id}`);
    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      alert("Une erreur est survenue lors de la création de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Page Title */}
      <div className="bg-sewa-red text-white p-4 shadow-sm">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Link href="/" className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Nouvelle livraison</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* Addresses */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sewa-red" /> 
            Adresses
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Retrait</label>
                <button type="button" onClick={handleGetLocation} className="text-xs font-bold text-sewa-red flex items-center gap-1 hover:underline">
                  <Navigation className="w-3 h-3" />
                  {isLocating ? "Recherche..." : "Ma position"}
                </button>
              </div>
              <input {...register('pickup_address')} type="text" placeholder="Adresse de retrait..." className={`w-full bg-gray-50 border ${errors.pickup_address ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              {errors.pickup_address && <p className="text-xs text-red-500 mt-1">{errors.pickup_address.message}</p>}
              {locationError && <p className="text-xs text-orange-500 mt-1">{locationError}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Livraison</label>
              <input {...register('delivery_address')} type="text" placeholder="Adresse de livraison..." className={`w-full bg-gray-50 border ${errors.delivery_address ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              {errors.delivery_address && <p className="text-xs text-red-500 mt-1">{errors.delivery_address.message}</p>}
            </div>
          </div>
        </section>

        {/* Distance Slider (Mock) */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" /> 
              Distance estimée
            </h2>
            <span className="font-black text-sewa-red">{distance} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={distance} 
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-sewa-red"
          />
        </section>

        {/* Contacts */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" /> 
            Contacts
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expéditeur</label>
                <input {...register('sender_name')} type="text" placeholder="Nom" className={`w-full bg-gray-50 border ${errors.sender_name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tél Expéditeur</label>
                <input {...register('sender_phone')} type="tel" placeholder="+224..." className={`w-full bg-gray-50 border ${errors.sender_phone ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Receveur</label>
                <input {...register('receiver_name')} type="text" placeholder="Nom" className={`w-full bg-gray-50 border ${errors.receiver_name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tél Receveur</label>
                <input {...register('receiver_phone')} type="tel" placeholder="+224..." className={`w-full bg-gray-50 border ${errors.receiver_phone ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              </div>
            </div>
          </div>
        </section>

        {/* Urgency */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">Urgence</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'Standard', sub: 'Normale' },
              { id: 'express', label: 'Express', sub: '< 2h' },
              { id: 'vip', label: 'VIP', sub: 'Immédiat' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUrgency(u.id as any)}
                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${urgency === u.id ? 'border-sewa-red bg-red-50 text-sewa-red' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <span className="font-bold text-sm">{u.label}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">{u.sub}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" /> Paiement
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'orange_money', label: 'Orange', icon: CreditCard },
              { id: 'mobile_money', label: 'MoMo', icon: CreditCard },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentMethod(p.id as any)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === p.id ? 'border-sewa-red bg-red-50 text-sewa-red' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
              >
                <p.icon className="w-5 h-5" />
                <span className="font-bold text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4 pb-8">
          <button disabled={isSubmitting} type="submit" className="w-full bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-between font-bold hover:bg-gray-800 transition-colors shadow-xl shadow-gray-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="text-lg flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? 'Création en cours...' : 'Confirmer la commande'}
            </span>
            <span className="text-xl text-sewa-yellow">{totalPrice.toLocaleString('fr-FR')} GNF</span>
          </button>
        </div>
      </form>

    </div>
  );
}
