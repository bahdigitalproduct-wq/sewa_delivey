'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Lire le paramètre d'erreur depuis l'URL sans utiliser useSearchParams qui casse le build statique
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects.");
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
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour suivre vos livraisons.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                Adresse Email
              </label>
              <div className="mt-2 relative rounded-2xl shadow-sm">
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
                  className="block w-full pl-11 pr-4 py-4 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                Mot de passe
              </label>
              <div className="mt-2 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:ring-sewa-red focus:border-sewa-red transition-colors bg-gray-50"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-sewa-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sewa-red disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <>Se connecter <ArrowRight className="h-5 w-5" /></>
              )}
            </motion.button>
            
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Pas encore de compte ? </span>
              <Link href="/register" className="text-sm font-bold text-sewa-red hover:text-red-700 transition-colors">
                S'inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
