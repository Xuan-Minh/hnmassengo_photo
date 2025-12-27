# Portfolio d'Artiste – Han-Noah MASSENGO

Ce projet est un site vitrine Jamstack pour présenter les œuvres et projets photo de Han-Noah MASSENGO.

## Stack technique

- Next.js 14+ (App Router)
- Tailwind CSS
- Framer Motion
- Sanity.io (Headless CMS)
- Snipcart (e-commerce)
- next-intl (i18n)
- react-hook-form
- Déploiement Netlify

## Fonctionnalités

- Blog multilingue
- Galerie photo animée
- Vente de tirages
- Expérience utilisateur soignée

## Architecture du projet

```
├── app/                    # Pages et layouts (Next.js 13+ App Router)
│   ├── api/               # Routes API
│   ├── [locale]/          # Pages internationalisées
│   └── layout.jsx         # Layout racine
├── components/            # Composants React organisés par fonction
│   ├── index.js          # Barrel exports pour imports propres
│   ├── Blog*.jsx         # Composants blog
│   ├── Gallery*.jsx      # Composants galerie
│   ├── Shop*.jsx         # Composants e-commerce
│   ├── Contact*.jsx      # Composants contact
│   └── UI components     # Composants interface
├── lib/                   # Bibliothèques et utilitaires
│   ├── constants.js      # Constantes globales
│   ├── hooks.js          # Hooks React personnalisés
│   ├── utils.js          # Fonctions utilitaires
│   └── sanity.client.js  # Configuration Sanity
├── messages/             # Fichiers de traduction i18n
├── public/               # Assets statiques
│   ├── gallery/          # Images projets
│   ├── home/            # Images page d'accueil
│   └── contact.html     # Formulaire Netlify Forms
└── src/i18n/            # Configuration internationalization
```

---

> Développé par Xuan-Minh TRAN (Dev Artist, junior)

## Déploiement sur Netlify

Étapes rapides pour déployer ce projet sur Netlify :

1. Crée un compte sur https://app.netlify.com/ et connecte ton dépôt GitHub.
2. Dans Netlify, choisis le repository `hnmassengo_photo` et la branche `main`.
3. Configure les paramètres de build :
   - Build command : `npm run build`
   - Publish directory : `.next`
4. Ajoute les variables d'environnement (Settings > Build & deploy > Environment) :
   - `SANITY_PROJECT_ID` = ton projectId Sanity
   - `SANITY_DATASET` = (ex: `production`)
   - `SNIPCART_API_KEY` = clé Snipcart publique (si utilisé)
   - Autres secrets (ex : tokens API) si besoin
5. Vérifie que `netlify.toml` est présent (il active `@netlify/plugin-nextjs`).
6. Déclenche un déploiement (Netlify build). Si des erreurs apparaissent, consulte les logs (Build & deploy > Deploys) et partage-les.

Remarques :

- Le plugin `@netlify/plugin-nextjs` est installé en devDependency et Netlify l'utilisera automatiquement si `netlify.toml` est présent.
- Tu peux configurer les redirects ou headers supplémentaires dans `netlify.toml` si nécessaire.

## Développement local ✅

Pour démarrer le serveur de développement :

```bash
npm install
npm run dev
```

Note : si le port `3000` est déjà utilisé, Next choisira automatiquement un autre port (ex. `3001`). Pour forcer l'utilisation du port 3000, arrêtez le processus qui occupe le port (`lsof -i :3000`) ou démarrez avec :

```bash
PORT=3000 npm run dev
```

Netlify CLI : la CLI Netlify est installée globalement pour ce projet (préféré pour éviter des dépendances optionnelles dans `node_modules`). Si vous ne l'avez pas :

```bash
npm install -g netlify-cli
netlify login
netlify dev
```

## Tailwind CSS

Le projet utilise Tailwind CSS avec PostCSS. La configuration Tailwind se trouve dans `tailwind.config.js` ; les chemins `content` incluent :

```
./app/**/*.{js,jsx,ts,tsx}
./pages/**/*.{js,jsx,ts,tsx}
./components/**/*.{js,jsx,ts,tsx}
```

Assurez-vous que vos composants et pages respectent ces emplacements pour que Tailwind purge correctement les classes en production.
