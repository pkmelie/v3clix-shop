// api/webhook.js
// Webhook Stripe pour automatiser l'envoi des emails après paiement

import Stripe from 'stripe';
import { Resend } from 'resend';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialisation des services
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration S3 pour Contabo
const s3Client = new S3Client({
  region: 'eu-2',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
});

// Fonction pour générer un lien de téléchargement signé (expire après 24h)
async function generateDownloadLink(fileName) {
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: fileName,
  });

  // Lien valide pendant 24 heures
  const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
  return url;
}

// Template d'email
function getEmailTemplate(customerName, packName, downloadUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Merci pour votre achat !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${customerName},</p>
          
          <p>Merci d'avoir acheté <strong>${packName}</strong> !</p>
          
          <p>Votre contenu est prêt à être téléchargé. Cliquez sur le bouton ci-dessous :</p>
          
          <center>
            <a href="${downloadUrl}" class="button">📥 Télécharger mon pack</a>
          </center>
          
          <div class="warning">
            <strong>⚠️ Important :</strong> Ce lien de téléchargement est valide pendant <strong>24 heures</strong>. 
            Après ce délai, vous devrez nous contacter pour obtenir un nouveau lien.
          </div>
          
          <p>Si vous rencontrez un problème, n'hésitez pas à nous contacter à <a href="mailto:support@v3clix.shop">support@v3clix.shop</a></p>
          
          <p>Cordialement,<br><strong>L'équipe V3clix</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} V3clix Store - Tous droits réservés</p>
          <p>Cet email a été envoyé automatiquement suite à votre achat.</p>
        </div>
      </body>
    </html>
  `;
}

// Mapping des produits Stripe vers les fichiers ZIP
// À personnaliser avec vos vrais Price IDs de Stripe
const PRODUCT_MAPPING = {
  'price_1234567890': { // Remplacez par votre vrai Price ID
    name: 'Pack V3clix réaliste 1',
    fileName: 'pack-v3clix-1.zip'
  },
  'price_0987654321': {
    name: 'Pack V3clix réaliste 2',
    fileName: 'pack-v3clix-2.zip'
  },
  // Ajoutez tous vos packs ici
};

// Handler principal du webhook
export default async function handler(req, res) {
  // Ne traiter que les POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Traiter l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('Payment successful:', {
      customer: session.customer_email,
      amount: session.amount_total / 100,
      currency: session.currency,
    });

    try {
      // Récupérer les détails de la session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      // Trouver le produit correspondant
      const product = PRODUCT_MAPPING[priceId];

      if (!product) {
        throw new Error(`Product not found for price ID: ${priceId}`);
      }

      // Générer le lien de téléchargement sécurisé
      const downloadUrl = await generateDownloadLink(product.fileName);

      // Envoyer l'email avec Resend
      const emailResult = await resend.emails.send({
        from: 'V3clix Store <noreply@v3clix.shop>', // Utilisez votre domaine vérifié
        to: session.customer_email,
        subject: `Votre ${product.name} est prêt !`,
        html: getEmailTemplate(
          session.customer_details?.name || 'Client',
          product.name,
          downloadUrl
        ),
      });

      console.log('Email sent successfully:', emailResult);

      // Optionnel : Enregistrer la vente dans une base de données
      // await saveSaleToDatabase({ ... });

      return res.status(200).json({ 
        received: true, 
        emailSent: true,
        emailId: emailResult.id 
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Envoyer un email d'alerte à l'admin
      await resend.emails.send({
        from: 'Alerts <alerts@v3clix.shop>',
        to: 'admin@v3clix.shop', // Votre email
        subject: '🚨 Erreur envoi automatique',
        html: `
          <h2>Erreur lors de l'envoi automatique</h2>
          <p><strong>Client:</strong> ${session.customer_email}</p>
          <p><strong>Erreur:</strong> ${error.message}</p>
          <p>Merci d'envoyer manuellement le pack au client.</p>
        `,
      });

      return res.status(500).json({ 
        error: 'Failed to process payment',
        details: error.message 
      });
    }
  }

  // Autres événements Stripe (optionnel)
  if (event.type === 'payment_intent.payment_failed') {
    console.log('Payment failed:', event.data.object);
  }

  return res.status(200).json({ received: true });
}

// Configuration Vercel pour gérer les raw body (nécessaire pour Stripe)
export const config = {
  api: {
    bodyParser: false,
  },
};