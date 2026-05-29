-- Exécutez ce script pour donner les droits d'administrateur à votre compte
-- Remplacez 'votre@email.com' par l'adresse email de votre compte actuel.

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'votre@email.com'
);

-- Note: Si vous utilisez un numéro de téléphone au lieu de l'email pour vous connecter, 
-- utilisez plutôt cette requête :
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE phone = '+224623782865';  -- Remplacez par votre numéro exact
