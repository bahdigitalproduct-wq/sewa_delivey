# Projet : Sewa Delivery 🚀

## 1. Ce que l'application fait
**Sewa Delivery** est une plateforme web moderne de livraison de colis et de repas, conçue spécifiquement pour le marché de Conakry (Guinée). Elle permet aux utilisateurs (particuliers et restaurants partenaires) de :
- Commander des coursiers rapidement.
- Suivre leur livraison en temps réel sur une carte interactive.
- Gérer l'historique de leurs expéditions.
L'application est pensée pour être extrêmement robuste, rapide et surtout "Mobile-First" (optimisée pour les smartphones), avec une expérience utilisateur (UX) haut de gamme.

---

## 2. Toutes les fonctionnalités implémentées (Phase Frontend)
À ce stade, l'interface utilisateur (Frontend) est complète et interactive :

* **Page d'Accueil (`/`)** : 
  * Design premium avec micro-animations (Framer Motion).
  * Bouton de commande rapide via WhatsApp (fonctionnel).
  * Sections : Hero, Statistiques, Services, Témoignages et Footer.
* **Écran de Commande (`/commander`)** : 
  * Formulaire complexe géré par `react-hook-form` et validé via `zod`.
  * Saisie des adresses avec bouton "Ma position" (API HTML5 Geolocation).
  * Saisie des contacts expéditeur et receveur.
  * Curseur interactif simulant la distance (en km) avec calcul dynamique du prix de livraison.
  * Sélection du niveau d'urgence (Standard, Express, VIP) influençant le prix.
  * Choix du moyen de paiement (Cash, Orange Money, MoMo).
* **Écran de Suivi (`/suivi/[id_commande]`)** :
  * Intégration de `react-leaflet` pour la cartographie interactive (OpenStreetMap).
  * Design en écran scindé (Carte toujours visible à 50% de l'écran sur mobile, 100% à gauche sur PC).
  * Timeline de l'état de la commande (Confirmée, En route, etc.).
  * Informations du livreur avec boutons d'appels directs et WhatsApp.
* **Espace "Mes courses" (`/mes-courses`)** :
  * Tableau de bord des dépenses et statistiques des courses.
  * Formulaire de modification de profil.
  * Liste de l'historique des commandes avec badges de statuts.
* **Navigation Globale** :
  * **Header** (`/src/components/Header.tsx`) : Barre de navigation supérieure (fixe, effet glassmorphism) pour Desktop avec menu burger mobile.
  * **BottomNav** (`/src/components/BottomNav.tsx`) : Barre de navigation inférieure (style application mobile iOS/Android) visible uniquement sur mobile, avec détection automatique de la page active (`usePathname`).

---

## 3. La structure des fichiers
Le projet suit la structure standard de **Next.js (App Router)** :

```text
c:\projet\sewa_delivery\
├── public/                 # Assets (logo.png, images)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout racine (intègre Header et BottomNav globalement)
│   │   ├── page.tsx               # Page d'accueil (Landing page)
│   │   ├── globals.css            # Styles globaux (Tailwind)
│   │   ├── commander/
│   │   │   └── page.tsx           # Page de création de commande
│   │   ├── suivi/
│   │   │   └── [id_commande]/
│   │   │       └── page.tsx       # Page dynamique de tracking
│   │   └── mes-courses/
│   │       └── page.tsx           # Page Historique et Profil
│   ├── components/
│   │   ├── Header.tsx             # Composant global d'en-tête
│   │   ├── BottomNav.tsx          # Composant de navigation bas (Mobile)
│   │   └── MapComponent.tsx       # Composant Leaflet (chargé dynamiquement sans SSR)
└── package.json            # Dépendances du projet
```

---

## 4. Les technologies utilisées
* **Core** : React 18, Next.js 14 (App Router), TypeScript.
* **Styling** : Tailwind CSS (utilisé de manière pure sans librairie tierce de composants pour garder le contrôle total du design).
* **Icônes** : Lucide-React.
* **Animations** : Framer Motion.
* **Formulaires & Validation** : React-Hook-Form, Zod.
* **Cartographie** : Leaflet, React-Leaflet, OpenStreetMap.

---

## 5. Les décisions de design (Aesthetics & UX)
* **Couleurs** : Utilisation d'une palette vibrante autour du Rouge Sewa (`#sewa-red`) et Jaune Sewa (`#sewa-yellow`) pour un impact visuel fort.
* **Typographie & Formes** : Grandes bordures arrondies (`rounded-2xl`, `rounded-3xl`), polices épaisses (`font-black`, `font-bold`), et ombres douces (`shadow-sm`, `shadow-xl`) pour un effet "Premium" et "Application Native".
* **Lisibilité** : Les champs de saisie des formulaires utilisent un texte sombre (`text-gray-900`) et une épaisseur `font-medium` pour garantir que la saisie utilisateur soit parfaitement lisible, contrastant avec les `placeholder` gris.
* **Mobile-First** : Éléments interactifs larges, navigation en bas d'écran (`BottomNav`), marges de sécurité (`pb-20`, `pb-safe`) pour éviter le chevauchement avec les interfaces des téléphones.

---

## 6. Instructions pour un futur modèle IA (Next Steps)
Cher confrère IA, si vous reprenez ce projet, voici le contexte et la marche à suivre :

1. **Garder le Design Intact** : Le client accorde une énorme importance à l'esthétique. Les interfaces doivent rester premium, modernes, et utiliser les classes Tailwind existantes. Ne remplacez pas les composants par des librairies génériques.
2. **Prochaine Étape : Intégration Backend (Supabase)** :
   * Le Frontend actuel utilise des données simulées (Mock data). La priorité est de configurer **Supabase**.
   * **Authentification** : Privilégier la connexion par numéro de téléphone (OTP).
   * **Base de données (Schema requis)** : Créer les tables `profiles` (utilisateurs), et `orders` (id, adresses, prix, distance, statut, urgence, mode de paiement, id_utilisateur).
   * **Realtime** : La page de suivi (`/suivi/[id_commande]`) devra s'abonner aux événements Supabase Realtime pour mettre à jour la position du livreur et le statut de la commande en direct.
3. **Logique Métier** : Le calcul de prix actuellement simulé dans `/commander` devra être sécurisé via une fonction côté serveur ou Edge Function Supabase/Next.js.
4. **Code propre** : Utilisez toujours les outils de manipulation de fichiers avec précision. Ne jamais utiliser `cat` pour écrire du code via un shell. Utilisez `write_to_file` ou `multi_replace_file_content` pour modifier les composants proprement.
