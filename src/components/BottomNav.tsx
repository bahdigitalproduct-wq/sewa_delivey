'use client';

import { Home, PackageOpen, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  let active = 'accueil';
  if (pathname === '/commander') active = 'commander';
  else if (pathname === '/mes-courses') active = 'profil';

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-3 z-[500] shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe">
      <Link href="/" className={`flex flex-col items-center gap-1 ${active === 'accueil' ? 'text-sewa-red' : 'text-gray-400'}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Accueil</span>
      </Link>
      <Link href="/commander" className={`flex flex-col items-center gap-1 relative ${active === 'commander' ? 'text-sewa-red' : 'text-gray-400'}`}>
        <div className={`absolute -top-6 w-12 h-12 rounded-full border-4 border-gray-50 flex items-center justify-center shadow-lg ${active === 'commander' ? 'bg-sewa-red text-white' : 'bg-gray-900 text-white'}`}>
          <PackageOpen className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium mt-5">Commander</span>
      </Link>
      <Link href="/mes-courses" className={`flex flex-col items-center gap-1 ${active === 'profil' ? 'text-gray-900' : 'text-gray-400'}`}>
        <div className={`${active === 'profil' ? 'bg-gray-900 text-white p-1 rounded-lg' : ''}`}>
          <User className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-medium">Compte</span>
      </Link>
    </div>
  );
}
