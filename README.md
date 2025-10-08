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
- yet-another-react-lightbox
- Déploiement Vercel

## Fonctionnalités

- Blog multilingue
- Galerie photo animée
- Vente de tirages
- Expérience utilisateur soignée

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
