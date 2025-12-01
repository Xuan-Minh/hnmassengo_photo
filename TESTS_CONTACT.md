# Test du Formulaire de Contact - Guide de Debug

## Étapes à suivre sur hannoahmassengo.netlify.app

### 1. Test du formulaire simple
1. Allez sur `https://hannoahmassengo.netlify.app/test-form.html`
2. Remplissez le formulaire de test
3. Soumettez-le
4. Vérifiez si ça fonctionne (vous devriez voir une page de succès Netlify)

### 2. Vérification dans le Dashboard Netlify
1. Connectez-vous à https://app.netlify.com
2. Cliquez sur votre site `hannoahmassengo`
3. Allez dans l'onglet **Forms**
4. Vérifiez si vous voyez les formulaires :
   - `test-contact`
   - `contact`

### 3. Test du formulaire principal
1. Allez sur la page contact de votre site
2. Ouvrez la console (F12 → Console)
3. Remplissez et soumettez le formulaire
4. Regardez les logs dans la console :

**Logs attendus si tout va bien :**
```
=== FORM SUBMISSION DEBUG ===
Environment: production
Host: hannoahmassengo.netlify.app
fullName: [votre nom]
email: [votre email]
subject: [sujet]
message: [message]
form-name: contact
Is Netlify: true
Using Netlify Forms...
Data to encode: {fullName: "...", email: "...", ...}
Encoded data: fullName=...&email=...
Response status: 200
Form submitted successfully
```

**Si ça ne marche pas, vous verrez :**
```
=== FORM SUBMISSION FAILED ===
Status: [code d'erreur]
Status Text: [texte d'erreur]
Response Text: [détails de l'erreur]
```

### 4. Configuration des notifications email
Si le formulaire fonctionne mais pas les emails :

1. Dans Netlify Dashboard → Forms → **Form notifications**
2. Cliquez **Add notification**
3. Sélectionnez **Email notification**
4. Configurez :
   - **Email to notify** : `naux.pro@gmail.com`
   - **Form** : `contact`
   - **Email subject line** : `Nouveau message depuis le site`
   - **Email body** : `Vous avez reçu un nouveau message de {{ fullName }} ({{ email }}) : {{ message }}`

### 5. Dépannage

**Si le formulaire n'apparaît pas dans Netlify :**
- Redéployez le site (les formulaires sont détectés au build)
- Vérifiez que `public/contact-form.html` et `public/test-form.html` sont bien dans le dépôt

**Si vous obtenez une erreur 404 :**
- Le formulaire n'est pas détecté par Netlify
- Vérifiez la syntaxe des attributs `data-netlify="true"`

**Si vous obtenez une erreur 405 :**
- Problème de méthode HTTP
- Vérifiez que `method="POST"` est présent

### 6. Test final
Une fois que tout fonctionne :
1. Soumettez un message de test
2. Vérifiez dans Netlify Dashboard → Forms → contact
3. Vous devriez voir la soumission
4. Vérifiez votre email `naux.pro@gmail.com` (et les spams !)

## Commandes Git pour déployer les changements
```bash
git add .
git commit -m "Fix contact form configuration"
git push
```

Netlify redéploiera automatiquement.