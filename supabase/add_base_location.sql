-- Migration pour ajouter le lieu de stationnement des coursiers

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS base_location TEXT;
