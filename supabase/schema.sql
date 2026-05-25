-- Création de la table 'profiles' (Liée à auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'rider', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Création de la table 'orders' (Commandes)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Optionnel: NULL si commande sans compte
  sender_address JSONB NOT NULL,
  receiver_address JSONB NOT NULL,
  price NUMERIC NOT NULL,
  distance NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'en_route', 'delivered', 'cancelled')),
  urgency TEXT DEFAULT 'standard' CHECK (urgency IN ('standard', 'express', 'vip')),
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🔐 Activer Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour 'profiles'
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil."
  ON public.profiles FOR SELECT USING ( auth.uid() = id );

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil."
  ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- Politiques RLS pour 'orders'
CREATE POLICY "Les utilisateurs peuvent voir leurs propres commandes."
  ON public.orders FOR SELECT USING ( auth.uid() = user_id );

CREATE POLICY "Les utilisateurs peuvent créer des commandes."
  ON public.orders FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- IMPORTANT: Permettre le suivi d'une commande par son ID (pour /suivi/[id_commande])
CREATE POLICY "Tout le monde peut voir une commande avec son ID."
  ON public.orders FOR SELECT USING ( true );

-- ⚡ Activer Supabase Realtime pour la table 'orders'
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
