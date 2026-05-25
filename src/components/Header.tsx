'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/logo.png" alt="Sewa Delivery Logo" width={36} height={36} className="object-contain drop-shadow-sm" />
            <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Sewa Delivery</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-sewa-red transition-colors">Accueil</Link>
            <Link href="/commander" className="text-sm font-medium text-gray-600 hover:text-sewa-red transition-colors">Commander</Link>
            <Link href="/mes-courses" className="text-sm font-medium text-gray-600 hover:text-sewa-red transition-colors">Mes courses</Link>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/mes-courses" className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors">
                  <User className="w-4 h-4" />
                  Profil
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-sewa-red text-white px-6 py-2.5 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
                Se connecter
              </Link>
            )}
          </div>

          <button 
            className="md:hidden p-2 -mr-2 text-gray-600 hover:text-sewa-red transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 px-4 py-2 flex flex-col gap-2 shadow-xl absolute w-full z-40 overflow-hidden"
            >
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg">Accueil</Link>
              <Link href="/commander" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg">Commander</Link>
              <Link href="/mes-courses" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 p-3 hover:bg-gray-50 rounded-lg">Mes courses</Link>
              
              <div className="mt-2 mb-2 border-t border-gray-100 pt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link href="/mes-courses" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors text-center w-full">
                      <User className="w-5 h-5" /> Mon Profil
                    </Link>
                    <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 text-red-500 font-bold p-3 hover:bg-red-50 rounded-lg transition-colors text-center w-full">
                      <LogOut className="w-5 h-5" /> Se déconnecter
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-sewa-red text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-red-500/30 text-center w-full flex justify-center">
                    Se connecter
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16 md:h-20 shrink-0"></div>
    </>
  );
}
