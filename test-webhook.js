import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Mapping des produits
const PRODUCT_MAPPING = {
  'price_1SduWB6merlTwGt5ipy9GwpD': {
    name: 'Pack V3clix réaliste 1',
    fileName: 'pack-v3clix-1.zip',
    // Pour l'instant, utilisez un lien direct au lieu de S3
    downloadUrl: 'https://eu2.contabostorage.com/a1ebf2af76e940ebadda8eeb2e11ada2:v3clix-files/Pack_by_V3clix.rar'
  },
};

// Template email
function getEmailTemplate(customerName, packName, downloadUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Merci pour votre achat !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${customerName},</p>
          <p>Merci d'avoir acheté <strong>${packName}</strong> !</p>
          <p>Votre contenu est prêt à être téléchargé :</p>
          <center>
            <a href="${downloadUrl}" class="button">📥 Télécharger mon pack</a>
          </center>
          <div class="warning">
            <strong>⚠️ Important :</strong> Téléchargez votre pack rapidement.
          </div>
          <p>Si vous rencontrez un problème, contactez-nous.</p>
          <p>Cordialement,<br><strong>L'équipe V3clix</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} V3clix Store</p>
        </div>
      </body>
    </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  
  let event;
  let body;

  try {
    // Lire le body correctement pour Vercel
    if (typeof req.body === 'string') {
      body = req.body;
    } else {
      body = JSON.stringify(req.body);
    }

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('Payment received:', {
      customer: session.customer_details?.email,
      amount: session.amount_total / 100,
      currency: session.currency,
    });

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      const product = PRODUCT_MAPPING[priceId];

      if (!product) {
        throw new Error(`Product not found for: ${priceId}`);
      }

      // Envoyer l'email
      const emailResult = await resend.emails.send({
        from: 'V3clix Store <onboarding@resend.dev>',
        to: session.customer_details.email,
        subject: `Votre ${product.name} est prêt !`,
        html: getEmailTemplate(
          session.customer_details?.name || 'Client',
          product.name,
          product.downloadUrl
        ),
      });

      console.log('Email sent:', emailResult);

      return res.status(200).json({ 
        received: true, 
        emailSent: true 
      });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(200).json({ received: true });
}