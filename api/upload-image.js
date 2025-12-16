// api/upload-image.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3Client = new S3Client({
  region: 'eu-2',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bodyBuffer = await buffer(req);
    const body = JSON.parse(bodyBuffer.toString());
    
    const { image, fileName } = body;

    if (!image || !fileName) {
      return res.status(400).json({ error: 'Image and fileName required' });
    }

    // Extraire le type MIME et les données base64
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Déterminer l'extension
    const extension = mimeType.split('/')[1];
    const key = `images/${Date.now()}-${fileName}.${extension}`;

    console.log('📤 Uploading image to S3:', key);

    // Upload sur Contabo S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: mimeType,
      ACL: 'public-read',
    }));

    // Construire l'URL publique
    const imageUrl = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET}/${key}`;

    console.log('✅ Image uploaded:', imageUrl);

    return res.status(200).json({ 
      success: true, 
      url: imageUrl 
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
}