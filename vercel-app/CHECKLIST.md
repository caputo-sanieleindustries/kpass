# ✅ CHECKLIST PRE-DEPLOY

Completa questi passi prima di fare il deploy:

## 1. MongoDB Atlas Setup

- [ ] Account MongoDB Atlas creato
- [ ] Cluster M0 (free) creato
- [ ] Database user creato (username + password)
- [ ] Network Access configurato (0.0.0.0/0)
- [ ] Connection string ottenuto e testato
- [ ] Database name impostato su `safepass`

**Connection String Formato:**
```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/safepass?retryWrites=true&w=majority
```

---

## 2. Vercel Account

- [ ] Account Vercel attivo
- [ ] URL verificato: https://vercel.com/marcos-projects-fd9cd307

---

## 3. Preparazione Codice

- [ ] Tutte le dipendenze installate
```bash
cd /app/vercel-app
yarn install
```

- [ ] Build test completato
```bash
yarn build
```

- [ ] File .gitignore presente
- [ ] File vercel.json configurato
- [ ] Environment variables preparate

---

## 4. Environment Variables

### MONGODB_URI
```
✅ Ottenuto da MongoDB Atlas
✅ Include /safepass nel path
✅ Testato con mongosh
```

### JWT_SECRET
```bash
# Genera con:
openssl rand -hex 32

✅ Minimo 32 caratteri
✅ Salvato in sicuro
```

---

## 5. Verifica File Critici

- [ ] `/app/vercel-app/vercel.json` esiste
- [ ] `/app/vercel-app/package.json` corretto
- [ ] `/app/vercel-app/vite.config.js` configurato
- [ ] `/app/vercel-app/api/_lib/db.js` connection pooling
- [ ] `/app/vercel-app/api/_lib/auth.js` middleware JWT

---

## 6. Test Locale (Opzionale ma Raccomandato)

```bash
cd /app/vercel-app

# Create .env.local
echo "MONGODB_URI=YOUR_CONNECTION_STRING" > .env.local
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env.local

# Install and start
yarn install
yarn dev
```

Apri http://localhost:3000 e testa:
- [ ] Login page carica
- [ ] Registrazione funziona
- [ ] Dashboard accessibile

---

## 7. Deploy

### Opzione A: Script Automatico
```bash
./deploy.sh
```

### Opzione B: Vercel CLI
```bash
vercel login
vercel
vercel --prod
```

---

## 8. Post-Deploy Verification

- [ ] Sito accessibile (https://safepass-xxxxx.vercel.app)
- [ ] Registrazione funziona
- [ ] Login funziona
- [ ] Recovery key mostrato
- [ ] Dashboard carica
- [ ] Crea password test
- [ ] Import/export test

---

## 9. Configurazione Finale

- [ ] Environment variables verificati su Vercel Dashboard
- [ ] MongoDB Atlas monitoring attivo
- [ ] Vercel Analytics abilitato
- [ ] Custom domain configurato (opzionale)

---

## 🎯 PRONTO PER IL DEPLOY!

Se tutti i checkbox sono ✅, procedi con:

```bash
cd /app/vercel-app
./deploy.sh
```

O segui le istruzioni in `START_HERE.md`

---

## ⚠️ TROUBLESHOOTING RAPIDO

### Build Fallisce
```bash
cd /app/vercel-app
yarn build
# Controlla errori
```

### MongoDB Connection Error
```bash
# Test connection
mongosh "YOUR_CONNECTION_STRING"
```

### Missing Dependencies
```bash
yarn install
```

### Vercel CLI Issues
```bash
npm install -g vercel
vercel login
```

---

**Hai completato tutto? DEPLOY NOW! 🚀**
