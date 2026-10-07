export default function handler(req, res) {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'Vercel Serverless ESM',
    timestamp: new Date().toISOString()
  });
}
