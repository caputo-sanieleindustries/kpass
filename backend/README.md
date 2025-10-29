# SafePass Backend - Node.js/Fastify

Backend per SafePass Password Manager completamente riscritto in Node.js con Fastify.

## Architettura

### Stack Tecnologico
- **Framework**: Fastify 5.x (performante e moderno)
- **Database**: MongoDB Native Driver
- **Autenticazione**: JWT (jsonwebtoken)
- **Crittografia**: bcrypt per password hashing
- **File Upload**: @fastify/multipart
- **Import/Export**: csv-parse, xlsx, xml2js

### Struttura Modulare

```
/app/backend/
├── server.js                 # Entry point
├── package.json              # Dependencies
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User model
│   └── PasswordEntry.js     # Password entry model
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── passwordController.js # CRUD passwords
│   └── importExportController.js # Import/Export
├── routes/
│   ├── authRoutes.js        # /api/auth/*
│   ├── passwordRoutes.js    # /api/passwords/*
│   └── importExportRoutes.js # /api/passwords/import|export
└── middleware/
    └── auth.js              # JWT verification
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register con recovery key
- `POST /api/auth/login` - Login con JWT
- `POST /api/auth/recover` - Password recovery

### Passwords (Richiede JWT)
- `GET /api/passwords` - Lista password
- `POST /api/passwords` - Crea password
- `PUT /api/passwords/:id` - Aggiorna password
- `DELETE /api/passwords/:id` - Elimina password

### Import/Export (Richiede JWT)
- `POST /api/passwords/import` - Import CSV/XML/XLSX/XLSM
- `GET /api/passwords/export?format=csv` - Export in vari formati

## Funzionalità

### Recovery Key System
- Generazione automatica recovery key (formato: XXXX-XXXX-XXXX-XXXX)
- Hash bcrypt per sicurezza
- Reset password tramite recovery key

### Multi-Format Import/Export
**Formati supportati:**
- CSV (1Password, LastPass, generico)
- XML (struttura gerarchica)
- XLSX/XLSM (Excel)

**Auto-mapping colonne:**
- LastPass: name→title, extra→notes
- 1Password: compatibilità diretta
- Password sempre criptate in export

## Installazione

```bash
cd /app/backend
yarn install
```

## Avvio

```bash
# Produzione
node server.js

# Development con auto-reload
yarn dev
```

## Variabili Ambiente (.env)

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=*
```

## Note Tecniche

- **ES Modules**: Usa `import/export` invece di `require`
- **Async/Await**: Tutto il codice è async-first
- **Error Handling**: Strutturato con try/catch e reply codes
- **Logging**: Fastify built-in logger
- **Security**: bcrypt salt rounds = 10, JWT 24h expiration

## Performance

Fastify è ~2x più veloce di Express grazie a:
- Schema-based validation
- Optimized routing
- Native async/await support
- Low overhead
