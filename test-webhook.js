// test-webhook.js
// Script pour tester le système de webhook localement

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  console.log('🧪 Test du système de webhook V3clix\n');

  try {
    // 1. Créer une session de paiement test
    console.log('1. Création d\'une session de paiement test...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1234567890', // Remplacez par un vrai Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://v3clix.shop/success',
      cancel_url: 'https://v3clix.shop/cancel',
      customer_email: 'test@example.com',
    });

    console.log('✅ Session créée:', session.id);
    console.log('📧 Email client:', session.customer_email);
    console.log('💰 Montant:', session.amount_total / 100, session.currency.toUpperCase());
    
    // 2. Simuler le paiement (en mode test)
    console.log('\n2. Pour tester le paiement complet:');
    console.log('👉 Ouvrez cette URL:', session.url);
    console.log('💳 Utilisez la carte test: 4242 4242 4242 4242');
    console.log('📅 Date: n\'importe quelle date future');
    console.log('🔢 CVC: n\'importe quel 3 chiffres');
    
    // 3. Instructions pour vérifier le webhook
    console.log('\n3. Vérification du webhook:');
    console.log('👉 Dashboard Stripe > Développeurs > Webhooks');
    console.log('👉 Vérifiez que votre webhook reçoit l\'événement');
    console.log('👉 Vérifiez les logs Vercel pour voir l\'exécution');
    
    // 4. Test de l'email
    console.log('\n4. Test de l\'email:');
    console.log('👉 Après le paiement, un email doit arriver à:', session.customer_email);
    console.log('👉 Vérifiez aussi les spams');
    console.log('👉 Dashboard Resend pour voir les logs d\'envoi');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'resource_missing') {
      console.log('\n💡 Conseil: Vérifiez que le Price ID existe dans votre Dashboard Stripe');
    }
  }
}

// Test de connexion aux services
async function testConnections() {
  console.log('🔌 Test des connexions aux services...\n');
  
  // Test Stripe
  try {
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe connecté - Solde:', balance.available[0].amount / 100, balance.available[0].currency.toUpperCase());
  } catch (error) {
    console.error('❌ Stripe:', error.message);
  }
  
  // Test Resend
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend connecté');
  } catch (error) {
    console.error('❌ Resend:', error.message);
  }
  
  // Test Storage
  try {
    const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
    const s3 = new S3Client({
      region: 'eu-2',
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
      },
    });
    
    const buckets = await s3.send(new ListBucketsCommand({}));
    console.log('✅ Storage connecté - Buckets:', buckets.Buckets.length);
  } catch (error) {
    console.error('❌ Storage:', error.message);
  }
  
  console.log('\n');
}

// Menu principal
const args = process.argv.slice(2);

if (args[0] === 'test') {
  testWebhook();
} else if (args[0] === 'check') {
  testConnections();
} else {
  console.log(`
📦 Script de test V3clix

Usage:
  npm run test-webhook        - Affiche les commandes disponibles
  node test-webhook.js test   - Créer une session de paiement test
  node test-webhook.js check  - Vérifier les connexions aux services

Variables d'environnement requises:
  - STRIPE_SECRET_KEY
  - RESEND_API_KEY
  - STORAGE_ENDPOINT
  - STORAGE_ACCESS_KEY
  - STORAGE_SECRET_KEY

Assurez-vous d'avoir un fichier .env.local configuré.
  `);
}