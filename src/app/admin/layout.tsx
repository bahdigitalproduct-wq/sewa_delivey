import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GlobalAdminAlert from "@/components/admin/GlobalAdminAlert";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "God Mode | Sewa Delivery",
  description: "Centre de Contrôle Sewa Delivery",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=Accès refusé. Veuillez vous connecter.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/login?error=Accès Interdit. Compte administrateur requis.');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <GlobalAdminAlert />
      
      {/* Sidebar Fixe */}
      <AdminSidebar />
      
      {/* Contenu principal (avec marge pour la sidebar) */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
