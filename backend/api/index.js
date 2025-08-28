import app from '../index.js'
import mongoose from 'mongoose'
import { connectDb } from '../lib/connectdb.js'

// Vercel serverless function handler
export default async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_URL || ''

  // Set CORS headers for Vercel
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Ensure DB connection per-invocation in serverless
  if (mongoose.connection.readyState !== 1 && process.env.MONGO_URI) {
    try {
      await connectDb()
    } catch (e) {
      console.error('DB connect error in serverless handler:', e)
      // Continue; some routes may not need DB
    }
  }
  
  // Let Express handle the request
  app(req, res)
}