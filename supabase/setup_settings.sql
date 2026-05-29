-- Création de la table app_settings pour les paramètres de tarification globaux
CREATE TABLE IF NOT EXISTS public.app_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Un seul enregistrement
    base_price NUMERIC NOT NULL DEFAULT 15000, -- Prix de base en GNF
    price_per_km NUMERIC NOT NULL DEFAULT 2000, -- Prix par km en GNF
    surge_multiplier NUMERIC NOT NULL DEFAULT 1.0, -- Multiplicateur (ex: pluie = 1.5)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Assurer qu'il n'y ait qu'une seule ligne
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'single_row') THEN
        ALTER TABLE public.app_settings ADD CONSTRAINT single_row CHECK (id = 1);
    END IF;
END $$;

-- Insérer la ligne par défaut
INSERT INTO public.app_settings (id, base_price, price_per_km, surge_multiplier)
VALUES (1, 15000, 2000, 1.0)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs (et anonymes) peuvent lire les settings pour le calcul du prix
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Tout le monde peut lire les parametres'
    ) THEN
        CREATE POLICY "Tout le monde peut lire les parametres" ON public.app_settings FOR SELECT USING (true);
    END IF;
END $$;

-- Modification des paramètres (démo : ouvert à tous pour l'instant)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Tout le monde peut modifier les parametres'
    ) THEN
        CREATE POLICY "Tout le monde peut modifier les parametres" ON public.app_settings FOR UPDATE USING (true);
    END IF;
END $$;

-- Activer realtime pour cette table
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
