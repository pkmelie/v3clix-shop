<<<<<<< HEAD
# 🚀 V3clix Store

Boutique en ligne automatisée pour vendre des packs avec envoi automatique par email après paiement.

## ✨ Fonctionnalités

- ✅ **Interface d'administration** - Gérez vos packs sans coder
- ✅ **Paiements Stripe** - Cartes bancaires + PayPal
- ✅ **Envoi automatique** - Email avec lien de téléchargement après paiement
- ✅ **Stockage sécurisé** - Liens de téléchargement temporaires (24h)
- ✅ **Design moderne** - Interface responsive et élégante
- ✅ **Persistance des données** - Vos packs sont sauvegardés

## 🛠️ Technologies

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Vercel Functions
- **Paiements**: Stripe (avec PayPal)
- **Emails**: Resend
- **Stockage**: Contabo S3 / Backblaze B2
- **Hébergement**: Vercel (gratuit)

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/v3clix-store.git
cd v3clix-store
npm install
```

### 2. Configuration

Copiez `.env.example` en `.env.local` et remplissez vos clés :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos vraies valeurs :

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
STORAGE_ENDPOINT=https://...
STORAGE_BUCKET=v3clix-files
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
```

### 3. Développement local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

### 4. Tester le système

```bash
# Vérifier les connexions aux services
node test-webhook.js check

# Créer une session de paiement test
node test-webhook.js test
```

## 🚀 Déploiement sur Vercel

### Via GitHub (recommandé)

1. Push votre code sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com)
3. Import votre repository
4. Ajoutez les variables d'environnement dans Settings → Environment Variables
5. Déployez !

### Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## ⚙️ Configuration Stripe

### 1. Créer vos produits

1. Dashboard Stripe → Produits
2. Créez un produit pour chaque pack
3. Notez les **Price ID** (commence par `price_`)

### 2. Configurer le webhook

1. Dashboard Stripe → Développeurs → Webhooks
2. Ajoutez un endpoint : `https://v3clix.shop/api/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Notez le **Signing Secret** (commence par `whsec_`)

### 3. Mettre à jour le mapping

Dans `api/webhook.js`, mettez à jour `PRODUCT_MAPPING` :

```javascript
const PRODUCT_MAPPING = {
  'price_1234567890': {
    name: 'Pack V3clix réaliste 1',
    fileName: 'pack-v3clix-1.zip'
  },
  // Ajoutez tous vos packs
};
```

## 📧 Configuration Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez et vérifiez votre domaine
3. Copiez votre API Key
4. Mettez à jour l'adresse `from` dans `api/webhook.js` :

```javascript
from: 'V3clix Store <noreply@votredomaine.com>'
```

## 💾 Stockage des fichiers

### Option A : Contabo (recommandé, 2.99€/mois)

1. Créez un compte [Contabo Object Storage](https://contabo.com)
2. Créez un bucket `v3clix-files`
3. Uploadez vos fichiers ZIP
4. Notez vos credentials S3

### Option B : Backblaze B2 (10GB gratuit)

1. Créez un compte [Backblaze](https://www.backblaze.com/b2)
2. Créez un bucket
3. Générez des clés d'application
4. Même configuration S3

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `src/index.css` pour changer le thème :

```css
:root {
  --primary: #9333ea;
  --secondary: #ec4899;
}
```

### Changer le logo

Remplacez le composant dans `src/App.jsx` :

```jsx
<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
  {/* Votre logo */}
</div>
```

## 🔐 Sécurité

### Changer le mot de passe admin

Dans `src/App.jsx`, ligne ~50 :

```javascript
if (adminPassword === 'votre-nouveau-mdp-fort') {
  setIsAdmin(true);
}
```

**Important** : Pour un système en production, utilisez une vraie authentification avec base de données.

## 📊 Monitoring

### Logs Vercel

- Vercel Dashboard → Your Project → Logs
- Voir les requêtes en temps réel

### Logs Stripe

- Dashboard Stripe → Développeurs → Logs
- Voir tous les webhooks reçus

### Logs Resend

- Dashboard Resend → Logs
- Voir tous les emails envoyés

## 💰 Coûts

| Service | Coût |
|---------|------|
| Vercel | Gratuit |
| Domaine | ~12€/an |
| Contabo Storage 250GB | 2,99€/mois |
| Stripe | 2,9% + 0,25€ par transaction |
| Resend | Gratuit (3000 emails/mois) |
| **TOTAL** | **~5€/mois + 2,9% par vente** |

## 🐛 Dépannage

### Les emails ne partent pas

1. Vérifiez que votre domaine est vérifié sur Resend
2. Vérifiez les logs Vercel pour voir les erreurs
3. Testez votre API Key Resend

### Le webhook ne fonctionne pas

1. Vérifiez l'URL du webhook : `https://v3clix.shop/api/webhook`
2. Vérifiez le Signing Secret dans Vercel
3. Consultez les logs Stripe

### Les fichiers ne se téléchargent pas

1. Vérifiez que votre bucket est accessible
2. Vérifiez les credentials S3
3. Testez la génération de lien signé

## 📞 Support

- Issues GitHub : [github.com/votre-username/v3clix-store/issues](https://github.com)
- Documentation Stripe : [stripe.com/docs](https://stripe.com/docs)
- Documentation Resend : [resend.com/docs](https://resend.com/docs)

## 📄 Licence

MIT License - Utilisez librement pour vos projets !

## 🙏 Remerciements

Construit avec ❤️ pour simplifier la vente de produits numériques.

---

=======
# 🚀 V3clix Store

Boutique en ligne automatisée pour vendre des packs avec envoi automatique par email après paiement.

## ✨ Fonctionnalités

- ✅ **Interface d'administration** - Gérez vos packs sans coder
- ✅ **Paiements Stripe** - Cartes bancaires + PayPal
- ✅ **Envoi automatique** - Email avec lien de téléchargement après paiement
- ✅ **Stockage sécurisé** - Liens de téléchargement temporaires (24h)
- ✅ **Design moderne** - Interface responsive et élégante
- ✅ **Persistance des données** - Vos packs sont sauvegardés

## 🛠️ Technologies

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Vercel Functions
- **Paiements**: Stripe (avec PayPal)
- **Emails**: Resend
- **Stockage**: Contabo S3 / Backblaze B2
- **Hébergement**: Vercel (gratuit)

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/v3clix-store.git
cd v3clix-store
npm install
```

### 2. Configuration

Copiez `.env.example` en `.env.local` et remplissez vos clés :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos vraies valeurs :

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
STORAGE_ENDPOINT=https://...
STORAGE_BUCKET=v3clix-files
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
```

### 3. Développement local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

### 4. Tester le système

```bash
# Vérifier les connexions aux services
node test-webhook.js check

# Créer une session de paiement test
node test-webhook.js test
```

## 🚀 Déploiement sur Vercel

### Via GitHub (recommandé)

1. Push votre code sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com)
3. Import votre repository
4. Ajoutez les variables d'environnement dans Settings → Environment Variables
5. Déployez !

### Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## ⚙️ Configuration Stripe

### 1. Créer vos produits

1. Dashboard Stripe → Produits
2. Créez un produit pour chaque pack
3. Notez les **Price ID** (commence par `price_`)

### 2. Configurer le webhook

1. Dashboard Stripe → Développeurs → Webhooks
2. Ajoutez un endpoint : `https://v3clix.shop/api/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Notez le **Signing Secret** (commence par `whsec_`)

### 3. Mettre à jour le mapping

Dans `api/webhook.js`, mettez à jour `PRODUCT_MAPPING` :

```javascript
const PRODUCT_MAPPING = {
  'price_1234567890': {
    name: 'Pack V3clix réaliste 1',
    fileName: 'pack-v3clix-1.zip'
  },
  // Ajoutez tous vos packs
};
```

## 📧 Configuration Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez et vérifiez votre domaine
3. Copiez votre API Key
4. Mettez à jour l'adresse `from` dans `api/webhook.js` :

```javascript
from: 'V3clix Store <noreply@votredomaine.com>'
```

## 💾 Stockage des fichiers

### Option A : Contabo (recommandé, 2.99€/mois)

1. Créez un compte [Contabo Object Storage](https://contabo.com)
2. Créez un bucket `v3clix-files`
3. Uploadez vos fichiers ZIP
4. Notez vos credentials S3

### Option B : Backblaze B2 (10GB gratuit)

1. Créez un compte [Backblaze](https://www.backblaze.com/b2)
2. Créez un bucket
3. Générez des clés d'application
4. Même configuration S3

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `src/index.css` pour changer le thème :

```css
:root {
  --primary: #9333ea;
  --secondary: #ec4899;
}
```

### Changer le logo

Remplacez le composant dans `src/App.jsx` :

```jsx
<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
  {/* Votre logo */}
</div>
```

## 🔐 Sécurité

### Changer le mot de passe admin

Dans `src/App.jsx`, ligne ~50 :

```javascript
if (adminPassword === 'votre-nouveau-mdp-fort') {
  setIsAdmin(true);
}
```

**Important** : Pour un système en production, utilisez une vraie authentification avec base de données.

## 📊 Monitoring

### Logs Vercel

- Vercel Dashboard → Your Project → Logs
- Voir les requêtes en temps réel

### Logs Stripe

- Dashboard Stripe → Développeurs → Logs
- Voir tous les webhooks reçus

### Logs Resend

- Dashboard Resend → Logs
- Voir tous les emails envoyés

## 💰 Coûts

| Service | Coût |
|---------|------|
| Vercel | Gratuit |
| Domaine | ~12€/an |
| Contabo Storage 250GB | 2,99€/mois |
| Stripe | 2,9% + 0,25€ par transaction |
| Resend | Gratuit (3000 emails/mois) |
| **TOTAL** | **~5€/mois + 2,9% par vente** |

## 🐛 Dépannage

### Les emails ne partent pas

1. Vérifiez que votre domaine est vérifié sur Resend
2. Vérifiez les logs Vercel pour voir les erreurs
3. Testez votre API Key Resend

### Le webhook ne fonctionne pas

1. Vérifiez l'URL du webhook : `https://v3clix.shop/api/webhook`
2. Vérifiez le Signing Secret dans Vercel
3. Consultez les logs Stripe

### Les fichiers ne se téléchargent pas

1. Vérifiez que votre bucket est accessible
2. Vérifiez les credentials S3
3. Testez la génération de lien signé

## 📞 Support

- Issues GitHub : [github.com/votre-username/v3clix-store/issues](https://github.com)
- Documentation Stripe : [stripe.com/docs](https://stripe.com/docs)
- Documentation Resend : [resend.com/docs](https://resend.com/docs)

## 📄 Licence

MIT License - Utilisez librement pour vos projets !

## 🙏 Remerciements

Construit avec ❤️ pour simplifier la vente de produits numériques.

---

>>>>>>> 18043f8 (Sauvegarde des changements locaux)
**Bon succès avec votre boutique ! 🚀**