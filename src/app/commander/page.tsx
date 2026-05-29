'use client';

import { ArrowLeft, MapPin, Navigation, Package, Wallet, CreditCard, Banknote, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const QUARTIERS_CONAKRY = [
  "Aéroport", "Almamya", "Ansoumania", "Aviation", "Baïlobaya", "Bambéto", "Bantounka", "Belle-Vue", "Bonfi", "Boulbinet", "Boussoura", 
  "Camayenne", "Cameroun", "Camp Alpha Yaya", "Carrière", "Cimenterie", "Cité Enco 5", "Cité Solidarité", "Coléah", "Coronthie", "Cosa", "Coyah", 
  "Dabondy", "Dabompa", "Dar-Es-Salam", "Démoudoula", "Dixinn Bora", "Dixinn Gare", "Dixinn Port", "Domino", "Dubréka", 
  "Enco 5", "Entag", "Fassia", "Fotoba", "Foulamadina", "Gbessia", "Gbéssia Cité", "Gbéssia Port", "Gomboyah", 
  "Hafia", "Hamdallaye", "Hermakono", "Kagbelen", "Kakimbo", "Kaporo", "Kaporo-Rails", "Kassa", "Kassonya", "Keitayah", "Kénien", 
  "Kipé", "Kipé-Dadya", "Kissosso", "KM36", "Kobaya", "Koloma", "Kouléwondy", "Kountia", "Lambanyi", "Landréah", "Lansanayah", 
  "Madina", "Madina Marché", "Mafanco", "Maneah", "Manquepas", "Matam", "Matoto Centre", "Minière", 
  "Nongo", "Nongo-Taady", "Petit Simbaya", "Ratoma", "Samatara", "Sandervalia", "Sangoyah", "Sangoyah-Mosquée", "Sanoyah", "Siguiriya", 
  "Simbaya", "Simbaya Gare", "Somayah", "Sonfonia", "Sonfonia Gare", "Sonfonia Lac", 
  "T5", "T6", "T7", "T8", "T9", "T10", "Taouyah", "Taouyah Corniche", "Tombo", "Tombolia", "Touguiwondy", "Téminétaye", "Wanindara", "Yattaya", "Yimbaya"
];

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
  const [appSettings, setAppSettings] = useState({
    base_price: 15000,
    price_per_km: 2000,
    surge_multiplier: 1.0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (data) setAppSettings(data);
    };
    fetchSettings();
  }, [supabase]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema)
  });
  
  let urgencyMultiplier = 1;
  if (urgency === 'express') urgencyMultiplier = 1.5;
  if (urgency === 'vip') urgencyMultiplier = 2;

  const totalPrice = Math.round((appSettings.base_price + (distance * appSettings.price_per_km)) * urgencyMultiplier * appSettings.surge_multiplier);

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
        () => {
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
              <input {...register('delivery_address')} list="quartiers-conakry" type="text" placeholder="Quartier de livraison..." className={`w-full bg-gray-50 border ${errors.delivery_address ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:border-sewa-red transition-colors`} />
              <datalist id="quartiers-conakry">
                {QUARTIERS_CONAKRY.map((quartier) => (
                  <option key={quartier} value={quartier} />
                ))}
              </datalist>
              {errors.delivery_address && <p className="text-xs text-red-500 mt-1">{errors.delivery_address.message}</p>}
            </div>
          </div>
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

        <div className="pt-4 pb-8">
          <button disabled={isSubmitting} type="submit" className="w-full bg-sewa-red text-white rounded-2xl p-4 flex items-center justify-center font-bold hover:bg-red-700 transition-colors shadow-xl shadow-red-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="text-lg flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? 'Création en cours...' : 'Confirmer la commande'}
            </span>
          </button>
        </div>
      </form>

    </div>
  );
}
