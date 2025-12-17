import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  endpoint: process.env.CONTABO_ENDPOINT,
  region: 'eu',
  credentials: {
    accessKeyId: process.env.CONTABO_ACCESS_KEY,
    secretAccessKey: process.env.CONTABO_SECRET_KEY,
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, packId } = req.body

    if (!image || !packId) {
      return res.status(400).json({ error: 'Missing data' })
    }

    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )

    const key = `packs/${packId}/cover.webp`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CONTABO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        ACL: 'public-read',
      })
    )

    const url = `${process.env.CONTABO_ENDPOINT}/${process.env.CONTABO_BUCKET}/${key}`

    res.status(200).json({ success: true, url })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
}
