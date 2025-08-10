#!/bin/bash

# Al-Qayim Management System - Vercel Deployment Script

echo "🚀 Starting deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test your API endpoints"
echo "3. Verify frontend is working"
echo "4. Check MongoDB connection"