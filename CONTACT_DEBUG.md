# Debug Guide - Formulaire de Contact

## 1. Vérifications côté Netlify

### Après déploiement sur Netlify :
1. Allez dans votre dashboard Netlify
2. Cliquez sur votre site
3. Allez dans **Site settings** > **Forms**
4. Vérifiez que le formulaire "contact" apparaît dans la liste
5. Si le formulaire n'apparaît pas :
   - Le build n'a pas détecté le formulaire
   - Vérifiez que `public/contact-form.html` existe
   - Redéployez le site

### Configuration des notifications :
1. Dans **Site settings** > **Forms** > **Form notifications**
2. Cliquez sur **Add notification**
3. Choisissez **Email notification**
4. Email de destination : `naux.pro@gmail.com`
5. Formulaire : sélectionnez "contact"
6. Sauvegardez

## 2. Tests de soumission

### Console du navigateur :
Ouvrez les DevTools (F12) et regardez la console lors de la soumission.
Vous devriez voir :
```
=== FORM SUBMISSION DEBUG ===
Environment: production
Host: votresite.netlify.app
Is Netlify: true
Using Netlify Forms...
fullName: [valeur saisie]
email: [valeur saisie]
subject: [valeur saisie]
message: [valeur saisie]
Response status: 200
Form submitted successfully
```

### Si ça ne marche pas :
- Vérifiez le status de la réponse (doit être 200)
- Regardez les erreurs dans la console
- Vérifiez l'onglet Network pour voir la requête POST

## 3. Onglet Forms de Netlify

Après soumission réussie :
1. Allez dans **Site dashboard** > **Forms**
2. Cliquez sur le formulaire "contact"
3. Vous devriez voir les soumissions
4. Vérifiez si les emails sont envoyés depuis les **Form notifications**

## 4. Problèmes fréquents

### Le formulaire n'apparaît pas dans Netlify :
- Le fichier `public/contact-form.html` doit être présent
- Redéployez après avoir ajouté le fichier

### Emails non reçus :
- Vérifiez les spams
- Vérifiez la configuration des notifications
- L'email `naux.pro@gmail.com` doit être correct

### Erreur 404 ou 405 :
- Vous êtes probablement en local
- Testez sur le site Netlify déployé

## 5. Test en local

En développement local (`localhost:3000`), le formulaire utilise l'API `/api/contact` qui log simplement les données dans la console serveur.