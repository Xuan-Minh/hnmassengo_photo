# Portfolio d'Artiste – Han-Noah MASSENGO

Un site vitrine moderne et performant pour présenter les œuvres photographiques de Han-Noah MASSENGO. Construit avec Next.js 16, Sanity CMS et déployé sur Netlify.

## 🚀 Aperçu du Projet

Ce portfolio présente :

- Une galerie photo interactive avec animations fluides
- Un blog multilingue (Français, Anglais, Allemand)
- Une boutique en ligne pour l'achat de tirages
- Une expérience utilisateur optimisée pour mobile et desktop
- Un CMS headless pour une gestion facile du contenu

## ✨ Fonctionnalités

- **Galerie Photo** : Navigation immersive avec Framer Motion
- **Blog Multilingue** : Articles avec catégories et extraits
- **E-commerce** : Intégration Snipcart pour ventes de tirages
- **Internationalisation** : Support complet FR/EN/DE avec next-intl
- **Performance** : Optimisation d'images, lazy loading, Core Web Vitals
- **SEO** : Sitemap automatique, métadonnées structurées
- **Accessibilité** : Conformité WCAG avec textes alternatifs

## 🛠️ Stack Technique

### Frontend

- **Next.js 16** - Framework React avec App Router et Turbopack
- **React 19** - Bibliothèque UI avec hooks modernes
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations et transitions fluides

### Backend & CMS

- **Sanity.io** - Headless CMS pour gestion du contenu
- **Snipcart** - Solution e-commerce sans serveur

### Outils de Développement

- **ESLint** - Linting avec configuration moderne
- **Prettier** - Formatage automatique du code
- **Jest** - Tests unitaires
- **TypeScript** - Typage optionnel

### Déploiement

- **Netlify** - Hébergement avec CI/CD intégré
- **Netlify Forms** - Gestion des formulaires de contact

## 📋 Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Compte Sanity.io (pour le CMS)
- Compte Netlify (pour le déploiement)

## 🚀 Installation et Configuration

### 1. Clonage du Repository

```bash
git clone https://github.com/username/hnmassengo_photo.git
cd hnmassengo_photo
```

### 2. Installation des Dépendances

```bash
npm install
```

### 3. Configuration de l'Environnement

Créez un fichier `.env.local` à la racine :

```env
# Sanity CMS
SANITY_PROJECT_ID=votre_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01

# Snipcart (optionnel pour la boutique)
# Clé publique (utilisée côté navigateur)
NEXT_PUBLIC_SNIPCART_API_KEY=votre_cle_api_snipcart

# (Optionnel) ancien nom gardé pour compat
SNIPCART_API_KEY=votre_cle_api_snipcart

# Autres variables si nécessaire
NEXT_PUBLIC_SITE_URL=https://votre-domaine.netlify.app
```

### 4. Configuration Sanity

```bash
# Installation de Sanity CLI (si pas déjà fait)
npm install -g @sanity/cli

# Connexion à votre compte Sanity
sanity login

# Configuration du projet
sanity init
```

## 🏗️ Développement Local

### Démarrage du Serveur de Développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

### Démarrage avec Netlify CLI (recommandé)

```bash
# Installation globale de Netlify CLI
npm install -g netlify-cli

# Connexion
netlify login

# Démarrage local avec fonctions serverless
netlify dev
```

## 📁 Structure du Projet

```
├── app/                          # Pages et layouts Next.js (App Router)
│   ├── api/                      # Routes API
│   │   ├── contact/              # API contact
│   │   └── loading-images/       # API images de chargement
│   ├── [locale]/                 # Pages internationalisées
│   │   ├── legal/                # Pages légales
│   │   └── page.jsx              # Page d'accueil
│   ├── layout.jsx                # Layout racine
│   ├── not-found.jsx             # Page 404
│   └── provider.jsx              # Providers React
├── components/                   # Composants React
│   ├── Blog*.jsx                 # Composants blog
│   ├── Gallery*.jsx              # Composants galerie
│   ├── Shop*.jsx                 # Composants e-commerce
│   ├── index.js                  # Exports barrel
│   └── *.jsx                     # Autres composants UI
├── lib/                          # Utilitaires et configurations
│   ├── constants.js              # Constantes globales
│   ├── events.js                 # Gestion des événements
│   ├── hooks.js                  # Hooks personnalisés
│   ├── logger.js                 # Logging
│   ├── sanity.client.js          # Client Sanity
│   └── utils.js                  # Fonctions utilitaires
├── messages/                     # Fichiers de traduction i18n
│   ├── en.json
│   ├── fr.json
│   └── de.json
├── public/                       # Assets statiques
│   ├── fonts/                    # Polices
│   ├── icons/                    # Icônes
│   ├── images/                   # Images optimisées
│   └── *.html                    # Pages statiques
├── sanity/                       # Configuration Sanity Studio
│   ├── env.js                    # Variables d'environnement
│   ├── structure.js              # Structure du studio
│   ├── lib/                      # Utilitaires Sanity
│   └── schemaTypes/              # Schémas de contenu
│       ├── index.js
│       ├── projectType.js        # Schéma projets
│       ├── eventType.js          # Schéma articles blog
│       ├── shopItem.js           # Schéma produits
│       └── loadingImageType.js   # Schéma images chargement
├── src/
│   └── next-intl.config.js       # Configuration i18n
└── Configuration racine
    ├── next.config.js            # Configuration Next.js
    ├── tailwind.config.js        # Configuration Tailwind
    ├── postcss.config.js         # Configuration PostCSS
    ├── eslint.config.mjs         # Configuration ESLint
    ├── jest.config.js            # Configuration tests
    └── netlify.toml              # Configuration Netlify
```

## 🧪 Tests

### Tests Unitaires

```bash
npm test
```

### Linting

```bash
# Vérification
npm run lint

# Correction automatique
npm run lint:fix
```

### Formatage

```bash
# Vérification
npm run format:check

# Formatage automatique
npm run format
```

## 🚀 Build et Déploiement

### Build de Production

```bash
npm run build
```

### Génération du Sitemap

```bash
npm run sitemap
```

### Analyse du Bundle

```bash
npm run analyze
```

### Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify
3. Le déploiement se déclenche automatiquement sur push

## 📊 Scripts Disponibles

| Commande           | Description             |
| ------------------ | ----------------------- |
| `npm run dev`      | Démarrage développement |
| `npm run build`    | Build production        |
| `npm run start`    | Démarrage production    |
| `npm run lint`     | Vérification linting    |
| `npm run lint:fix` | Correction linting      |
| `npm run format`   | Formatage code          |
| `npm run sitemap`  | Génération sitemap      |
| `npm run analyze`  | Analyse bundle          |

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 👨‍💻 Auteur

Développé par Xuan-Minh TRAN (Dev Artist, junior)

---

_Portfolio de Han-Noah MASSENGO - Photographe professionnel_
