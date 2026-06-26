-- Migration pour créer la table 'coursiers'
-- Cette table est indépendante de auth.users, permettant une gestion simple par l'admin

CREATE TABLE IF NOT EXISTS public.coursiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  tel TEXT NOT NULL,
  lieu_stationnement TEXT,
  statut TEXT DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.coursiers ENABLE ROW LEVEL SECURITY;

-- Autoriser tout le monde à lire/écrire pour l'instant (à restreindre plus tard pour l'admin uniquement)
CREATE POLICY "Enable read access for all users" ON public.coursiers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.coursiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.coursiers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.coursiers FOR DELETE USING (true);
