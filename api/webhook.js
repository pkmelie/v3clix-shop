import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmjszzqlyfnyhsvftwgi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // ⚠️ Clé privée !

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * 🔎 Récupère le pack depuis Supabase grâce au stripe_price_id
 */
async function getPackByPriceId(priceId) {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante');
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/packs?stripe_price_id=eq.${priceId}&select=*`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erreur Supabase: ${error}`);
  }

  const data = await res.json();
  return data[0] || null;
}

/**
 * 📧 Template email
 */
function getEmailTemplate(customerName, packName, downloadUrl) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background:#f5f5f5; padding:20px; margin:0; }
        .box { background:white; padding:30px; border-radius:8px; max-width:600px; margin:0 auto; }
        .btn { display:inline-block; background:#667eea; color:white; padding:15px 30px; text-decoration:none; border-radius:5px; margin:20px 0; }
        .btn:hover { background:#5568d3; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>🎉 Merci pour votre achat !</h2>
        <p>Bonjour ${customerName},</p>
        <p>Vous avez acheté <strong>${packName}</strong>.</p>
        <p>
          <a class="btn" href="${downloadUrl}">
            📥 Télécharger mon pack
          </a>
        </p>
        <p style="color:#666; font-size:14px;">
          Ce lien est personnel et ne doit pas être partagé.
        </p>
        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
        <p style="color:#999; font-size:12px;">— L'équipe V3clix</p>
      </div>
    </body>
  </html>
  `;
}

/**
 * 🔧 Lit le body brut pour Next.js
 */
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('❌ Signature Stripe manquante');
    return res.status(400).json({ error: 'No signature' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // ✅ Gestion de l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Vérification de l'email
      if (!session.customer_details?.email) {
        throw new Error('Email client manquant');
      }

      // 🧾 Récupération des produits achetés
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, );

      if (!lineItems.data || lineItems.data.length === 0) {
        throw new Error('Aucun produit dans la session');
      }

      console.log(`📦 ${lineItems.data.length} produit(s) acheté(s)`);

      // 🔁 Traiter chaque produit (si plusieurs)
      for (const item of lineItems.data) {
        const priceId = item.price.id;
        console.log(`💳 Traitement du price_id: ${priceId}`);

        // 🔎 Récupérer le pack depuis Supabase
        const pack = await getPackByPriceId(priceId);

        if (!pack) {
          console.warn(`⚠️ Pack introuvable pour price_id ${priceId}`);
          continue;
        }

        if (!pack.zip_url) {
          console.warn(`⚠️ Pas de zip_url pour le pack ${pack.name}`);
          continue;
        }

        // 📧 Envoi de l'email
        const emailResult = await resend.emails.send({
          from: 'V3clix Store <noreply@v3clix-shop.com>',
          to: session.customer_details.email,
          subject: `Votre ${pack.name} est prêt !`,
          html: getEmailTemplate(
            session.customer_details.name || 'Client',
            pack.name,
            pack.zip_url
          ),
        });

        console.log(`✅ Email envoyé pour ${pack.name} (ID: ${emailResult.id})`);
      }

    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error.message);
      // On renvoie quand même 200 pour éviter que Stripe réessaie
      return res.status(200).json({ 
        received: true, 
        error: error.message 
      });
    }
  }

  return res.status(200).json({ received: true });
}