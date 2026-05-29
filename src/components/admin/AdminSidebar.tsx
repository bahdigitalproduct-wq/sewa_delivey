'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, Settings, LogOut, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Live Radar', href: '/admin/radar', icon: Map },
  { name: 'Flotte', href: '/admin/flotte', icon: Users },
  { name: 'Admins', href: '/admin/admins', icon: ShieldCheck },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 bg-gray-900 h-16 md:h-screen fixed bottom-0 left-0 md:top-0 text-white flex flex-row md:flex-col shadow-2xl z-[1000]">
      {/* Header Sidebar (caché sur mobile) */}
      <div className="hidden md:flex p-6 items-center gap-3 border-b border-gray-800">
        <div className="bg-white rounded-xl p-1 shrink-0">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <h2 className="font-black text-lg leading-none tracking-tight">SEWA</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col justify-around md:justify-start space-x-1 md:space-x-0 md:space-y-2 overflow-x-auto overflow-y-hidden md:overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all duration-200 font-medium text-[10px] md:text-sm min-w-[60px] ${
                isActive 
                  ? 'bg-sewa-red text-white shadow-md shadow-sewa-red/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="md:inline-block">{item.name}</span>
            </Link>
          );
        })}
        {/* Bouton Quitter (Uniquement icône sur mobile) */}
        <Link href="/" className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-[10px] md:text-sm min-w-[60px] md:hidden">
          <LogOut className="w-5 h-5" />
          <span>Quitter</span>
        </Link>
      </nav>

      {/* Footer Sidebar (Desktop) */}
      <div className="hidden md:block p-4 border-t border-gray-800">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-sm">
          <LogOut className="w-5 h-5" />
          Quitter l'Admin
        </Link>
      </div>
    </div>
  );
}
