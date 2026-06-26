'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState('/');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRedirect = params.get('redirect');
    if (urlRedirect) {
      setRedirectPath(urlRedirect);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setError("Inscription réussie. Vérifiez votre boîte mail si vous avez activé la confirmation par email.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex justify-center cursor-pointer"
          >
            <div className="bg-sewa-red text-white font-black text-2xl px-4 py-2 rounded-2xl shadow-lg">
              SEWA
            </div>
          </motion.div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rejoignez la révolution de la livraison.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-medium ${error.includes('réussie') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-gray-900">
                Nom complet
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Mamadou Barry"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-900">
                Téléphone
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+224 6XX XX XX XX"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                Email
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 mt-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-sewa-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sewa-red disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>S'inscrire <ArrowRight className="h-5 w-5" /></>
              )}
            </motion.button>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Déjà un compte ? </span>
              <Link href={`/login${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`} className="text-sm font-bold text-sewa-red hover:text-red-700 transition-colors">
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
