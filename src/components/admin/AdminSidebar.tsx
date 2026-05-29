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
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white flex flex-col shadow-2xl z-[1000]">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="bg-white rounded-xl p-1 shrink-0">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <h2 className="font-black text-lg leading-none tracking-tight">SEWA</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                isActive 
                  ? 'bg-sewa-red text-white shadow-md shadow-sewa-red/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium text-sm">
          <LogOut className="w-5 h-5" />
          Quitter l'Admin
        </Link>
      </div>
    </div>
  );
}
