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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          margin: 0;
        }
      
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
      
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
        }
      
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 20px;
        }
      
        .logo {
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          animation: float 3s ease-in-out infinite;
        }
      
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      
        .logo img {
          max-width: 80%;
          max-height: 80%;
          object-fit: contain;
        }
      
        .header h1 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          position: relative;
          z-index: 2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
      
        .content {
          padding: 40px 30px;
        }
      
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
          font-weight: 600;
        }
      
        .message {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
          margin-bottom: 30px;
        }
      
        .pack-name {
          color: #667eea;
          font-weight: 700;
          font-size: 18px;
        }
      
        .download-section {
          text-align: center;
          margin: 40px 0;
        }
      
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 18px 40px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
      
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
      
        .btn:hover::before {
          left: 100%;
        }
      
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }
      
        .btn-icon {
          margin-right: 8px;
          font-size: 20px;
        }
      
        .security-note {
          background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
          border-left: 4px solid #667eea;
          padding: 15px 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
      
        .security-note p {
          color: #667eea;
          font-size: 14px;
          margin: 0;
          font-weight: 600;
        }
      
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
          margin: 30px 0;
        }
      
        .footer {
          text-align: center;
          padding: 30px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
      
        .footer p {
          color: #9ca3af;
          font-size: 14px;
          margin: 5px 0;
        }
      
        .social-links {
          margin-top: 20px;
        }
      
        .social-links a {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          margin: 0 5px;
          line-height: 40px;
          color: white;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
      
        .social-links a:hover {
          transform: scale(1.1);
        }
      
        .sparkle {
          display: inline-block;
          animation: sparkle 1.5s ease-in-out infinite;
        }
      
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header avec logo -->
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <!-- Remplacez cette URL par votre logo -->
              <img src="https://via.placeholder.com/100x100/667eea/ffffff?text=V3CLIX" alt="V3clix Logo">
            </div>
          </div>
          <h1><span class="sparkle">✨</span> Merci pour votre achat ! <span class="sparkle">✨</span></h1>
        </div>
      
        <!-- Contenu principal -->
        <div class="content">
          <p class="greeting">Bonjour ${customerName} 👋</p>
        
          <p class="message">
            Nous sommes ravis de vous compter parmi nos clients !<br>
            Vous venez d'acheter <span class="pack-name">${packName}</span> et votre commande est prête.
          </p>
        
          <!-- Bouton de téléchargement -->
          <div class="download-section">
            <a class="btn" href="${downloadUrl}">
              <span class="btn-icon">📥</span>
              Télécharger mon pack maintenant
            </a>
          </div>
        
          <!-- Note de sécurité -->
          <div class="security-note">
            <p>🔒 Ce lien est personnel et ne doit pas être partagé avec d'autres personnes.</p>
          </div>
        
          <div class="divider"></div>
        
          <p class="message">
            Besoin d'aide ? Notre équipe est là pour vous accompagner.<br>
            N'hésitez pas à nous contacter si vous avez la moindre question.
          </p>
        </div>
      
        <!-- Footer -->
        <div class="footer">
          <p style="font-weight: 600; color: #667eea; font-size: 16px;">V3clix Store</p>
          <p>L'équipe qui vous accompagne dans vos projets</p>
        
          <div class="social-links">
            <a href="#" title="Instagram">📷</a>
            <a href="#" title="Twitter">🐦</a>
            <a href="#" title="Discord">💬</a>
          </div>
        
          <p style="margin-top: 20px; font-size: 12px;">
            © 2024 V3clix. Tous droits réservés.
          </p>
        </div>
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