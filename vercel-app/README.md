# SafePass - Vercel Edition

Password manager completo costruito con **React + Vite** e **Vercel Serverless Functions**.

## 🚀 Stack Tecnologico

- **Frontend**: React 18 + Vite
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel

## 📁 Struttura Progetto

```
vercel-app/
├── src/                    # Frontend React
│   ├── pages/             # Login, Register, Dashboard, Recover
│   ├── components/        # UI components + shadcn
│   ├── utils/             # Crypto utilities
│   └── App.jsx
├── api/                    # Vercel Serverless Functions
│   ├── _lib/              # Shared utilities
│   │   ├── db.js         # MongoDB connection
│   │   ├── auth.js       # JWT middleware
│   │   ├── models.js     # Data models
│   │   └── utils.js      # Helper functions
│   ├── auth/              # Authentication endpoints
│   │   ├── register.js
│   │   ├── login.js
│   │   └── recover.js
│   └── passwords/         # Password management
│       ├── index.js       # GET/POST /api/passwords
│       ├── [id].js        # PUT/DELETE /api/passwords/:id
│       ├── import.js      # POST /api/passwords/import
│       └── export.js      # GET /api/passwords/export
├── public/
├── index.html
├── vite.config.js
├── vercel.json            # Vercel configuration
└── package.json
```

## 🔧 Setup Locale

### 1. Installa dipendenze

```bash
cd vercel-app
yarn install
```

### 2. Configura MongoDB Atlas

Crea un cluster gratuito su [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) e ottieni la connection string.

### 3. Variabili d'ambiente

Crea `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safepass?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

### 4. Avvia development server

```bash
yarn dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 📦 Deploy su Vercel

### 1. Installa Vercel CLI

```bash
npm i -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Configura Environment Variables

Nel dashboard Vercel:
1. Settings → Environment Variables
2. Aggiungi:
   - `MONGODB_URI`: La tua connection string MongoDB Atlas
   - `JWT_SECRET`: Una chiave segreta robusta (min 32 caratteri)

### 5. Deploy Production

```bash
vercel --prod
```

## 🔒 Funzionalità

### Autenticazione
- ✅ Registrazione con master password
- ✅ Login con JWT authentication
- ✅ Recovery key system per reset password
- ✅ Client-side encryption con Web Crypto API

### Password Management
- ✅ CRUD completo password
- ✅ Crittografia lato client (AES-GCM + PBKDF2)
- ✅ Generatore password casuali
- ✅ Toggle show/hide password
- ✅ Copia negli appunti

### Import/Export
- ✅ CSV (1Password, LastPass, generico)
- ✅ XML
- ✅ XLSX/XLSM (Excel)
- ✅ Auto-mapping colonne
- ✅ Password sempre criptate in export

## 🏗️ Architettura Vercel

### Serverless Functions

Ogni file in `/api` diventa un endpoint:
- File-based routing
- Automatic HTTPS
- Edge network deployment
- Cold start ottimizzato

### MongoDB Connection Pooling

Le funzioni riutilizzano la connessione MongoDB:
```javascript
let cachedClient = null;
let cachedDb = null;
```

### CORS Handling

CORS gestito automaticamente con `handleCors()` wrapper.

## 🔐 Sicurezza

- **JWT**: Token firmati con HS256
- **bcrypt**: Password hashing con salt rounds = 10
- **Client-side encryption**: AES-GCM con chiave derivata da master password
- **Recovery key**: Hashata e salvata sicura nel database
- **MongoDB Atlas**: Crittografia at-rest e in-transit

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrazione + recovery key
- `POST /api/auth/login` - Login
- `POST /api/auth/recover` - Password recovery

### Passwords (Require JWT)
- `GET /api/passwords` - Lista password
- `POST /api/passwords` - Crea password
- `PUT /api/passwords/[id]` - Aggiorna password
- `DELETE /api/passwords/[id]` - Elimina password
- `POST /api/passwords/import` - Import file
- `GET /api/passwords/export?format=csv` - Export file

## 📝 Note

- **MongoDB Atlas Free Tier**: 512MB storage, perfetto per uso personale
- **Vercel Free Tier**: 100GB bandwidth/mese, serverless functions illimitate
- **Cold Starts**: Prima richiesta può essere lenta (~1-2s), poi veloce
- **File Upload**: Limitato a 4.5MB su Vercel Hobby plan

## 🛠️ Troubleshooting

### MongoDB Connection Error
Verifica:
1. Whitelist IP address su MongoDB Atlas (0.0.0.0/0 per Vercel)
2. Connection string corretta
3. Database user ha permessi read/write

### CORS Issues
Le funzioni hanno CORS pre-configurato. Se hai problemi, verifica `CORS_ORIGINS` env var.

### Import File Non Funziona
Vercel ha limite 4.5MB per file upload. Per file più grandi, usa storage esterno (S3, Cloudinary).

## 📚 Risorse

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
