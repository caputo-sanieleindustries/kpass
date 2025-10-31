# 🚀 DEPLOY VELOCE - 5 MINUTI

## Metodo 1: Vercel CLI (Raccomandato) ⚡

### Passo 1: Setup MongoDB Atlas (2 minuti)

1. **Vai su**: https://cloud.mongodb.com/
2. **Login** con Google/GitHub
3. **Crea progetto**: "SafePass"
4. **Build Database** → FREE M0
5. **Crea Database User**:
   - Username: `safepass_admin`
   - Password: Genera (salva!)
6. **Network Access** → Add IP: `0.0.0.0/0`
7. **Connect** → Drivers → Copia connection string:
   ```
   mongodb+srv://safepass_admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. **Modifica**: Aggiungi `/safepass` dopo `.net/`:
   ```
   mongodb+srv://safepass_admin:PASSWORD@cluster0.xxxxx.mongodb.net/safepass?retryWrites=true&w=majority
   ```

✅ **Connection string pronto!**

---

### Passo 2: Deploy con Script Automatico

Apri terminale ed esegui:

```bash
cd /app/vercel-app
./deploy.sh
```

Lo script ti chiederà:
1. **MONGODB_URI**: Incolla il connection string da sopra
2. **JWT_SECRET**: Premi INVIO per generare automaticamente

Poi:
- Fa build test
- Apre browser per login Vercel
- Fa deploy automatico

**Fatto!** 🎉

---

## Metodo 2: Vercel Dashboard (Alternativo)

### Passo 1: Push su GitHub

```bash
cd /app/vercel-app

# Inizializza git
git init
git add .
git commit -m "SafePass - Vercel Edition"

# Crea repo su GitHub (https://github.com/new)
# Poi:
git remote add origin https://github.com/TUO_USERNAME/safepass.git
git branch -M main
git push -u origin main
```

### Passo 2: Import su Vercel

1. Vai su: https://vercel.com/new
2. **Import Git Repository**
3. Seleziona il tuo repository `safepass`
4. **Framework Preset**: Vite
5. **Root Directory**: `./`

### Passo 3: Configura Environment Variables

In "Environment Variables" aggiungi:

**MONGODB_URI:**
```
mongodb+srv://safepass_admin:PASSWORD@cluster0.xxxxx.mongodb.net/safepass?retryWrites=true&w=majority
```

**JWT_SECRET:**
```bash
# Genera con:
openssl rand -hex 32
# Copia output e incolla
```

### Passo 4: Deploy

Clicca **Deploy** e aspetta 1-2 minuti.

**Fatto!** 🎉

---

## Dopo il Deploy

### Testa la tua app

Il tuo URL sarà tipo: `https://safepass-xxxxx.vercel.app`

1. **Apri il sito**
2. **Registra account** (salva recovery key!)
3. **Crea una password di test**
4. **Test import/export**

### Problemi Comuni?

#### ❌ "MongoDB connection failed"

**Soluzione:**
1. Vercel Dashboard → Settings → Environment Variables
2. Controlla che `MONGODB_URI` sia corretto
3. Verifica IP whitelist su MongoDB Atlas: `0.0.0.0/0`
4. Redeploy: Click **Deployments** → Latest → **Redeploy**

#### ❌ "JWT_SECRET missing"

**Soluzione:**
1. Genera: `openssl rand -hex 32`
2. Vercel Dashboard → Settings → Environment Variables
3. Add `JWT_SECRET` con il valore generato
4. Redeploy

#### ❌ Build failed

**Soluzione:**
1. Test locale: `cd /app/vercel-app && yarn build`
2. Se funziona, problema è environment variables
3. Check Vercel build logs per dettagli

---

## Custom Domain (Opzionale)

### Aggiungi il tuo dominio

1. Dashboard Vercel → Settings → Domains
2. Add Domain: `tuodominio.com`
3. Configura DNS:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`

SSL automatico in 10 minuti!

---

## Monitoring

### Dashboard Vercel
- **Analytics**: Visite, performance
- **Logs**: Real-time function logs
- **Deployments**: Storia di tutti i deploy

### MongoDB Atlas
- **Metrics**: Connections, operations
- **Performance Advisor**: Suggerimenti indici

---

## Update App

### Deploy nuova versione

**Se usi Git:**
```bash
git add .
git commit -m "Update feature"
git push
```
→ Vercel fa auto-deploy!

**Se usi CLI:**
```bash
vercel --prod
```

---

## Costi

### Sempre Gratis 🆓

**Vercel Hobby:**
- 100GB bandwidth/mese
- Serverless functions illimitate
- 100 deploy/day

**MongoDB Atlas M0:**
- 512MB storage
- 100 connections simultanee

### Per traffico alto

- **Vercel Pro**: $20/mese → 1TB bandwidth
- **MongoDB M10**: $57/mese → 10GB + backup

---

## Support

**Hai problemi?**

1. Leggi `VERCEL_DEPLOY.md` (troubleshooting dettagliato)
2. Check Vercel logs: Dashboard → Deployments → Latest → Function Logs
3. MongoDB Atlas logs: Dashboard → Monitoring

**Risorse:**
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

## Next Steps

✅ Deploy completato
✅ App funzionante
✅ HTTPS automatico

**Cosa fare ora:**

1. 🔒 **Salva Recovery Key** del tuo account admin
2. 📱 **Condividi link** con amici/famiglia
3. 🎨 **Personalizza** (logo, colori, domain)
4. 📊 **Monitora** uso su Vercel Dashboard

---

**Congratulazioni! 🎉**

La tua app SafePass è live su Vercel!
