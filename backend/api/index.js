import app from '../index.js'

// Vercel serverless function handler
export default function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  // Let Express handle the request
  app(req, res)
}