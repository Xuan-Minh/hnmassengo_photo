# Configuration des Notifications Email - Netlify Forms

## Étapes détaillées pour recevoir les emails

### 1. Navigation dans Netlify Dashboard

```
app.netlify.com → Votre site → Site settings (bouton en haut) → Forms (menu gauche)
```

### 2. Configuration des notifications

#### Onglet "Form notifications"

- Cliquez sur **Add notification**
- Sélectionnez **Email notification**

#### Configuration pour test-contact :

```
Email to notify: naux.pro@gmail.com
Form: test-contact
Subject line: [Contact] Nouveau message test
Email body (optionnel):
Nom: {{ name }}
Email: {{ email }}
Message: {{ message }}
```

#### Configuration pour contact (formulaire principal) :

```
Email to notify: naux.pro@gmail.com
Form: contact
Subject line: [Portfolio] Nouveau contact
Email body (optionnel):
Nom: {{ fullName }}
Email: {{ email }}
Sujet: {{ subject }}
Message: {{ message }}
```

### 3. Vérifications importantes

#### Vérifier l'adresse email

- `naux.pro@gmail.com` doit être exactement correcte
- Pas d'espaces avant/après
- Vérifiez que ce Gmail existe et fonctionne

#### Vérifier les formulaires détectés

Dans **Site settings → Forms**, vous devriez voir :

- ✅ `test-contact` (depuis /test-form.html)
- ✅ `contact` (depuis le site principal)

### 4. Test après configuration

#### Test 1 - Formulaire simple

1. Allez sur `hannoahmassengo.netlify.app/test-form.html`
2. Remplissez et envoyez
3. Vérifiez immédiatement :
   - Dashboard Netlify → Forms → test-contact (nouvelle entrée ?)
   - Email `naux.pro@gmail.com` (peut prendre 1-5 minutes)
   - Dossier spam de Gmail

#### Test 2 - Formulaire principal

1. Allez sur votre site → section contact
2. Remplissez et envoyez
3. Vérifiez de même

### 5. Dépannage email

#### Si pas d'email reçu :

1. **Vérifiez les spams** de `naux.pro@gmail.com`
2. **Délai** : Les emails Netlify peuvent prendre 1-10 minutes
3. **Vérifiez dans Dashboard** : Les soumissions apparaissent-elles dans Forms ?
4. **Double-vérifiez l'email** dans la configuration

#### Si les soumissions n'apparaissent pas dans Dashboard :

- Le formulaire n'est pas correctement configuré
- Problème avec `data-netlify="true"`

### 6. Emails de confirmation

Netlify envoie également des emails de confirmation quand vous configurez les notifications.
Si vous ne recevez pas cet email, il y a un problème avec l'adresse `naux.pro@gmail.com`.

## Checklist finale ✅

- [ ] Formulaires visibles dans Netlify Dashboard
- [ ] Notifications email configurées pour les 2 formulaires
- [ ] Email `naux.pro@gmail.com` vérifié
- [ ] Test effectué sur formulaire simple
- [ ] Email reçu (ou dans spams)
- [ ] Test effectué sur formulaire principal

## Remarques importantes

⚠️ **Les notifications ne fonctionnent que pour les sites déployés sur Netlify, pas en local**

⚠️ **Gmail peut mettre les premiers emails Netlify en spam - vérifiez le dossier spam**

⚠️ **Si ça ne marche toujours pas, essayez avec une autre adresse email pour tester**
