# 🚀 Guida Deploy Vercel - SafePass

## Prerequisiti

1. Account Vercel (gratuito): https://vercel.com/signup
2. Account MongoDB Atlas (gratuito): https://www.mongodb.com/cloud/atlas/register
3. Git repository (GitHub, GitLab, o Bitbucket)

## Parte 1: Setup MongoDB Atlas

### 1. Crea Cluster (2 minuti)
1. Vai su https://cloud.mongodb.com/
2. Crea nuovo progetto "SafePass"
3. Build Database → Free Shared (M0)
4. Provider: AWS, Region: più vicina a te
5. Cluster Name: "safepass-cluster"
6. Create

### 2. Configura Database Access
1. Security → Database Access
2. Add New Database User
3. Username: `safepass_user`
4. Password: Genera password sicura (salvala!)
5. Database User Privileges: Read and write to any database
6. Add User

### 3. Configura Network Access
1. Security → Network Access
2. Add IP Address
3. Allow Access From Anywhere: `0.0.0.0/0` (necessario per Vercel)
4. Confirm

### 4. Ottieni Connection String
1. Database → Connect
2. Connect your application
3. Driver: Node.js
4. Copia la connection string:
   ```
   mongodb+srv://safepass_user:<password>@safepass-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Sostituisci `<password>` con la password del database user
6. Aggiungi il database name: `.../safepass?retryWrites=true&w=majority`

## Parte 2: Preparazione Codice

### 1. Inizializza Git Repository

```bash
cd /app/vercel-app
git init
git add .
git commit -m "Initial commit: SafePass Vercel Edition"
```

### 2. Push su GitHub

```bash
# Crea nuovo repository su GitHub (github.com/new)
# Poi:
git remote add origin https://github.com/TUO_USERNAME/safepass.git
git branch -M main
git push -u origin main
```

## Parte 3: Deploy su Vercel

### Metodo 1: Dashboard Vercel (Raccomandato)

1. Vai su https://vercel.com/new
2. Import Git Repository
3. Seleziona il tuo repository `safepass`
4. Framework Preset: Vite
5. Root Directory: `./` (default)
6. Build Command: `yarn build` (default)
7. Output Directory: `dist` (default)

#### Configura Environment Variables:

Clicca "Environment Variables" e aggiungi:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://safepass_user:PASSWORD@safepass-cluster.xxxxx.mongodb.net/safepass?retryWrites=true&w=majority` |
| `JWT_SECRET` | Genera chiave random: `openssl rand -hex 32` |

8. Deploy

### Metodo 2: Vercel CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (segui i prompt)
vercel

# Durante il setup, quando chiede env vars:
# ? Set up "MONGODB_URI"? Yes
# ? What's the value of MONGODB_URI? [inserisci connection string]
# ? Set up "JWT_SECRET"? Yes  
# ? What's the value of JWT_SECRET? [inserisci chiave random]

# Deploy production
vercel --prod
```

## Parte 4: Verifica Deploy

### 1. Test Endpoints

Il tuo sito sarà disponibile su: `https://safepass-xxx.vercel.app`

```bash
# Test API
curl https://safepass-xxx.vercel.app/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"master_username":"test","master_password":"test123456"}'
```

### 2. Test Frontend

1. Apri `https://safepass-xxx.vercel.app`
2. Registra un nuovo account
3. Salva la recovery key
4. Prova a creare una password
5. Test import/export

## Parte 5: Custom Domain (Opzionale)

### 1. Aggiungi Domain
1. Dashboard Vercel → Settings → Domains
2. Add Domain: `tuodominio.com`
3. Configura DNS secondo le istruzioni Vercel

### 2. SSL Certificate
Vercel genera automaticamente certificato SSL (Let's Encrypt)

## Troubleshooting

### ❌ MongoDB Connection Failed

**Problema**: Serverless function non si connette a MongoDB

**Soluzione**:
1. Verifica connection string corretta
2. Verifica IP whitelist: 0.0.0.0/0
3. Verifica username/password database user
4. Test connection string localmente:
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/safepass"
   ```

### ❌ JWT_SECRET Missing

**Problema**: Errore "JWT_SECRET environment variable is required"

**Soluzione**:
1. Dashboard Vercel → Settings → Environment Variables
2. Aggiungi `JWT_SECRET` con valore random (min 32 caratteri)
3. Redeploy: `vercel --prod`

### ❌ CORS Errors

**Problema**: Frontend non può chiamare API

**Soluzione**:
1. Verifica `vercel.json` corretto
2. Verifica che le funzioni usino `handleCors()` wrapper
3. Check browser console per errori specifici

### ❌ Build Failed

**Problema**: Deploy fallisce durante build

**Soluzione**:
1. Testa build locale: `yarn build`
2. Verifica `vite.config.js` corretto
3. Check Vercel build logs per errore specifico

### ❌ File Import Non Funziona

**Problema**: Errore durante import file CSV/Excel

**Soluzione**:
1. Vercel ha limite 4.5MB per file
2. Usa file più piccoli o split in multiple importazioni
3. Per file grandi, considera storage esterno (S3, Cloudinary)

## Performance Tips

### 1. MongoDB Connection Pooling

Le funzioni già implementano caching della connessione:
```javascript
let cachedClient = null;
let cachedDb = null;
```

Questo riduce cold starts da ~2s a ~200ms dopo prima esecuzione.

### 2. Edge Functions (Opzionale)

Per latenza ultra-bassa, converti funzioni a Edge Runtime:

```javascript
export const config = {
  runtime: 'edge',
};
```

**Nota**: Edge runtime ha limitazioni (no fs, no alcune librerie Node)

### 3. MongoDB Index

Crea indici per query più veloci:

```javascript
// Connetti a MongoDB Atlas
use safepass

// Crea indici
db.users.createIndex({ "master_username": 1 }, { unique: true })
db.password_entries.createIndex({ "user_id": 1 })
```

## Monitoring

### 1. Vercel Analytics

1. Dashboard → Analytics
2. Monitora:
   - Page views
   - Response time
   - Error rate
   - Bandwidth usage

### 2. MongoDB Atlas Monitoring

1. Atlas Dashboard → Monitoring
2. Check:
   - Connection count
   - Operation execution time
   - Storage size

## Costi

### Free Tiers

**Vercel Hobby (Gratuito):**
- 100GB bandwidth/mese
- Serverless functions illimitate
- Custom domain
- Automatic HTTPS

**MongoDB Atlas M0 (Gratuito):**
- 512MB storage
- 100 connections
- Shared cluster

### Quando Upgradare?

**Vercel Pro ($20/mese):**
- 1TB bandwidth
- Più performance
- Team collaboration

**MongoDB Atlas M10 ($57/mese):**
- 10GB storage
- Dedicated cluster
- Backup automatici

## Sicurezza Production

### 1. Rotate JWT Secret

```bash
# Genera nuova chiave
openssl rand -hex 32

# Aggiorna su Vercel
vercel env add JWT_SECRET production
```

### 2. Enable MongoDB IP Whitelist

Per produzione seria, configura IP specifici invece di 0.0.0.0/0

### 3. Rate Limiting

Aggiungi rate limiting alle API:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // max 100 requests per IP
});
```

### 4. MongoDB Encryption

MongoDB Atlas ha encryption at-rest e in-transit di default.

## Support

- **Vercel**: https://vercel.com/support
- **MongoDB**: https://www.mongodb.com/support
- **GitHub Issues**: [Link al tuo repo]

---

**Congratulazioni! 🎉** 

La tua app SafePass è ora live su Vercel con MongoDB Atlas!
