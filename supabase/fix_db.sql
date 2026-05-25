-- 1. Synchroniser les profils manquants
-- (Si vous avez créé un compte AVANT d'ajouter le Trigger, cette commande le réparera)
INSERT INTO public.profiles (id, full_name, phone)
SELECT id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'phone'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Autoriser la création de commandes même si on n'est pas connecté
-- (Réparation de la politique RLS)
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des commandes." ON public.orders;

CREATE POLICY "Les utilisateurs peuvent créer des commandes."
  ON public.orders FOR INSERT 
  WITH CHECK ( auth.uid() = user_id OR user_id IS NULL );
