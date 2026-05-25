-- Autoriser les utilisateurs (ou commandes anonymes) à mettre à jour le statut de leurs commandes.
-- Indispensable pour que les boutons de test (Accepter, Mettre en route, Livré) fonctionnent sur la page de suivi !

DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres commandes." ON public.orders;

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres commandes."
  ON public.orders FOR UPDATE 
  USING ( auth.uid() = user_id OR user_id IS NULL );
