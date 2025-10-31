#!/bin/bash

# 🚀 Script Deploy Vercel - SafePass
# Esegui questo script per deployare su Vercel

echo "🚀 SafePass - Deploy su Vercel"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installazione Vercel CLI..."
    npm install -g vercel
fi

# Navigate to project directory
cd /app/vercel-app

echo ""
echo "⚠️  IMPORTANTE: Prima di procedere, assicurati di avere:"
echo "1. MongoDB Atlas connection string"
echo "2. JWT Secret (32+ caratteri random)"
echo ""
read -p "Hai già configurato MongoDB Atlas? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Per favore configura MongoDB Atlas prima:"
    echo "1. Vai su https://cloud.mongodb.com/"
    echo "2. Crea un cluster gratuito M0"
    echo "3. Crea un database user"
    echo "4. Whitelist IP: 0.0.0.0/0"
    echo "5. Ottieni la connection string"
    echo ""
    echo "Guida completa in: /app/vercel-app/VERCEL_DEPLOY.md"
    exit 1
fi

echo ""
echo "🔐 Configurazione Environment Variables"
echo ""

# Ask for MongoDB URI
read -p "Inserisci MONGODB_URI: " mongodb_uri
if [ -z "$mongodb_uri" ]; then
    echo "❌ MONGODB_URI è obbligatorio!"
    exit 1
fi

# Ask for JWT Secret
read -p "Inserisci JWT_SECRET (lascia vuoto per generare): " jwt_secret
if [ -z "$jwt_secret" ]; then
    jwt_secret=$(openssl rand -hex 32)
    echo "✅ Generato JWT_SECRET: $jwt_secret"
fi

# Create .env.local for testing
echo "MONGODB_URI=$mongodb_uri" > .env.local
echo "JWT_SECRET=$jwt_secret" >> .env.local
echo "✅ File .env.local creato"

echo ""
echo "🧪 Test build locale..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build fallito! Controlla gli errori sopra."
    exit 1
fi

echo "✅ Build locale completato con successo!"
echo ""
echo "🚀 Inizio deploy su Vercel..."
echo ""

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deploy completato!"
echo ""
echo "📝 Prossimi passi:"
echo "1. Vai su https://vercel.com/marcos-projects-fd9cd307"
echo "2. Seleziona il progetto appena deployato"
echo "3. Settings → Environment Variables"
echo "4. Verifica che MONGODB_URI e JWT_SECRET siano configurati"
echo "5. Se necessario, aggiungi manualmente e redeploy"
echo ""
echo "🌐 Il tuo sito è live!"
