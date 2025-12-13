# ⚡ Démarrage Rapide V3clix Store

Guide ultra-rapide pour lancer votre boutique en **30 minutes**.

---

## 🎯 CHECKLIST COMPLÈTE

### ☐ PHASE 1 : Préparation (5 min)

```bash
# 1. Créer les comptes (tous gratuits sauf Contabo)
✓ GitHub → github.com
✓ Vercel → vercel.com (connexion avec GitHub)
✓ Stripe → stripe.com/fr
✓ Resend → resend.com
✓ Contabo → contabo.com (2.99€/mois)
```

### ☐ PHASE 2 : Configuration Locale (10 min)

```bash
# 1. Créer le dossier projet
mkdir v3clix-store
cd v3clix-store

# 2. Télécharger tous les fichiers depuis les artifacts Claude
# Copier-coller chaque fichier dans le bon dossier

# 3. Installer les dépendances
npm install

# 4. Créer .env.local
cp .env.example .env.local
# Remplir avec vos vraies clés (voir ci-dessous)

# 5. Tester localement
npm run dev
# Ouvrir http://localhost:3000
```

### ☐ PHASE 3 : Configuration Stripe (5 min)

```bash
# 1. Dashboard Stripe → Produits → Nouveau produit
Nom: Pack V3clix réaliste 1
Prix: 9.99€
Type: Paiement unique

# 2. Activer PayPal
Paramètres → Méthodes de paiement → PayPal ✓

# 3. Créer un webhook
Développeurs → Webhooks → Ajouter
URL: https://votre-site.vercel.app/api/webhook
Événements: checkout.session.completed

# 4. Copier les clés
API Keys → Secret key → Copier dans .env.local
Webhooks → Signing secret → Copier dans .env.local
```

### ☐ PHASE 4 : Upload Fichiers ZIP (5 min)

```bash
# 1. Créer bucket Contabo
Object Storage → Create Bucket
Nom: v3clix-files

# 2. Upload vos ZIPs
Via interface web ou Cyberduck

# 3. Copier les URLs
Format: https://eu2.contabostorage.com/v3clix-files/pack-1.zip
```

### ☐ PHASE 5 : Déploiement (5 min)

```bash
# Option A : GitHub + Vercel (recommandé)
1. Push code sur GitHub
2. Vercel → New Project → Import
3. Ajouter variables d'environnement
4. Deploy !

# Option B : Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Ajouter variables d'environnement sur Vercel
Settings → Environment Variables → Add
```

---

## 🔑 VARIABLES D'ENVIRONNEMENT

Remplissez `.env.local` ET les variables Vercel avec ces valeurs :

```bash
# STRIPE
STRIPE_SECRET_KEY=sk_live_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# RESEND
RESEND_API_KEY=re_xxxxx

# CONTABO S3
STORAGE_ENDPOINT=https://eu2.contabostorage.com
STORAGE_BUCKET=v3clix-files
STORAGE_ACCESS_KEY=xxxxx
STORAGE_SECRET_KEY=xxxxx

# CONFIG
ADMIN_EMAIL=admin@v3clix.shop
SITE_URL=https://v3clix.shop
```

---

## 🎨 PERSONNALISATION RAPIDE

### 1. Changer le nom

**Dans `src/App.jsx` :**
```javascript
<h1>V3clix Store</h1>  // Remplacez par votre nom
```

### 2. Changer les couleurs

**Dans `src/index.css` :**
```css
:root {
  /* Changez les couleurs purple par vos couleurs */
  --primary: #9333ea;
  --secondary: #ec4899;
}
```

### 3. Changer le mot de passe admin

**Dans `src/App.jsx`, ligne 50 :**
```javascript
if (adminPassword === 'admin123') // Changez ici
```

### 4. Mapper vos produits Stripe

**Dans `api/webhook.js` :**
```javascript
const PRODUCT_MAPPING = {
  'price_1234567890': {  // Votre vrai Price ID
    name: 'Pack V3clix réaliste 1',
    fileName: 'pack-v3clix-1.zip'
  },
  // Ajoutez tous vos packs
};
```

---

## ✅ VÉRIFICATION FINALE

### Test complet du système :

```bash
# 1. Test connexions
node test-webhook.js check

# 2. Test paiement
node test-webhook.js test
# Cliquez sur le lien, utilisez carte test 4242 4242 4242 4242

# 3. Vérifier :
✓ Paiement réussi dans Dashboard Stripe
✓ Webhook reçu dans Logs Vercel
✓ Email reçu (vérifier spam)
✓ Lien de téléchargement fonctionne
```

---

## 🌐 NOM DE DOMAINE (Optionnel)

### Si vous voulez un vrai domaine :

```bash
# 1. Acheter sur Porkbun (~12€/an)
porkbun.com → Chercher "v3clix"
Options: .com, .shop, .store, .io

# 2. Configurer DNS
Type A: @ → 76.76.21.21
Type CNAME: www → cname.vercel-dns.com

# 3. Ajouter sur Vercel
Settings → Domains → Add: v3clix.shop

# 4. Attendre 10-30 min
```

---

## 📊 APRÈS LE LANCEMENT

### Choses à faire :

1. **Tester plusieurs fois** avec carte test
2. **Ajouter vos packs** via dashboard admin
3. **Personnaliser les emails** dans `api/webhook.js`
4. **Configurer Google Analytics** (optionnel)
5. **Créer page Success/Cancel** (optionnel)
6. **Ajouter CGV/Mentions légales** (obligatoire en EU)

### Monitoring :

```bash
# Logs en temps réel
✓ Vercel Dashboard → Logs
✓ Stripe Dashboard → Logs
✓ Resend Dashboard → Logs
```

---

## 🆘 PROBLÈMES COURANTS

### ❌ "npm install" échoue
```bash
# Solution : Utiliser Node 18+
node -v  # Vérifier version
# Installer nvm et Node 18 si nécessaire
```

### ❌ Webhook ne fonctionne pas
```bash
# Vérifier :
1. URL exacte du webhook
2. Signing secret correct
3. Événement "checkout.session.completed" activé
4. Logs Vercel pour voir l'erreur
```

### ❌ Email ne part pas
```bash
# Vérifier :
1. Domaine vérifié sur Resend
2. API Key correcte
3. from: utilise votre domaine vérifié
4. Logs Resend pour voir l'erreur
```

### ❌ Fichier ne se télécharge pas
```bash
# Vérifier :
1. Bucket public ou liens signés configurés
2. Credentials S3 corrects
3. URL du fichier correcte
4. CORS configuré sur bucket
```

---

## 💡 ASTUCES PRO

### Mode test Stripe
```bash
# Utilisez les clés test au début
sk_test_xxx  # Au lieu de sk_live_xxx

# Cartes de test :
4242 4242 4242 4242  # Succès
4000 0000 0000 0002  # Échec
4000 0000 0000 3220  # 3D Secure
```

### Tester localement les webhooks
```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger checkout.session.completed
```

### Sauvegardes
```bash
# Sauvegarder régulièrement :
1. Code sur GitHub
2. Packs sur backup externe
3. Variables d'environnement dans .env.backup
```

---

## 🎉 C'EST FAIT !

Votre boutique est maintenant :
- ✅ En ligne
- ✅ Sécurisée
- ✅ Automatisée
- ✅ Prête à vendre

**Premier test de vente :**
1. Ouvrez votre site
2. Cliquez sur "Acheter"
3. Utilisez `4242 4242 4242 4242`
4. Vérifiez que vous recevez l'email
5. Téléchargez le fichier

**Félicitations ! 🚀**

---

## 📞 BESOIN D'AIDE ?

- **Documentation** : README.md (guide complet)
- **Stripe Docs** : stripe.com/docs
- **Resend Docs** : resend.com/docs
- **Vercel Docs** : vercel.com/docs

**Temps total : ~30 minutes** ⏱️