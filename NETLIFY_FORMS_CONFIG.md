# Configuration Netlify Forms

## Configuration automatique

Le formulaire utilise la méthode officielle Netlify avec l'attribut `netlify="true"` directement dans le `<form>`. Netlify détecte automatiquement le formulaire au moment du déploiement.

**Attributs Netlify configurés :**

- `name="contact"` - Identifiant du formulaire
- `method="POST"` - Méthode de soumission
- `netlify="true"` - Active la détection Netlify
- `netlify-honeypot="bot-field"` - Protection anti-spam

## Étapes post-déploiement sur Netlify

1. **Déployez le site sur Netlify** (le formulaire sera automatiquement détecté)
2. **Vérifiez la détection** : `Site settings > Forms` (le formulaire "contact" doit apparaître)
3. **Configurez les notifications** dans le dashboard Netlify :
   - Allez dans `Site settings > Forms > Form notifications`
   - Cliquez sur `Add notification`
   - Choisissez `Email notification`
   - Ajoutez l'email : `naux.pro@gmail.com`
   - Sélectionnez le formulaire `contact`

## Configuration des emails dans Netlify Dashboard

### Option 1 : Via l'interface Netlify

1. Dashboard Netlify > Votre site > Settings > Forms
2. Form notifications > Add notification > Email notification
3. Email: `naux.pro@gmail.com`
4. Form: `contact`
5. Template: Custom ou Default

### Option 2 : Via les paramètres du site

Vous pouvez également configurer dans `Site settings > Build & deploy > Environment variables` :

- `CONTACT_EMAIL` = `naux.pro@gmail.com`

## Test du formulaire

Une fois déployé, testez le formulaire :

1. Remplissez tous les champs (tous sont obligatoires)
2. Cliquez sur "Send"
3. Vérifiez la réception à `naux.pro@gmail.com`

## Fonctionnalités implémentées

✅ Tous les champs obligatoires (full name, email, subject, message)
✅ Validation côté client et serveur
✅ Messages de succès/erreur
✅ Protection anti-spam (honeypot)
✅ Soumission asynchrone (pas de rechargement de page)
✅ Reset automatique du formulaire après envoi
✅ État de chargement pendant l'envoi

## Limites Netlify Forms (plan gratuit)

- 100 soumissions/mois
- Idéal pour un portfolio
