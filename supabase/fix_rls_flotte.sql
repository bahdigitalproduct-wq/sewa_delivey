-- Script pour réparer les politiques de sécurité (RLS) afin que l'administration puisse voir et gérer la flotte

-- 1. Permettre aux utilisateurs authentifiés de voir tous les profils (Nécessaire pour lister les coursiers)
DROP POLICY IF EXISTS "Permettre la lecture des profils" ON public.profiles;
CREATE POLICY "Permettre la lecture des profils"
  ON public.profiles FOR SELECT USING ( true );

-- 2. Permettre la mise à jour des rôles par les utilisateurs (Pour le God Mode de démonstration)
DROP POLICY IF EXISTS "Permettre la mise a jour des profils" ON public.profiles;
CREATE POLICY "Permettre la mise a jour des profils"
  ON public.profiles FOR UPDATE USING ( true );

-- Si vous avez des commandes existantes, on s'assure qu'elles peuvent toutes être modifiées
DROP POLICY IF EXISTS "Permettre la mise a jour globale des commandes" ON public.orders;
CREATE POLICY "Permettre la mise a jour globale des commandes"
  ON public.orders FOR UPDATE USING ( true );
