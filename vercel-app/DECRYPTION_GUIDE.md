# 🔓 Guida Decrittazione Password Esportate

## Perché le Password Sono Criptate?

SafePass cripta tutte le password **lato client** usando la tua master password. Quando esporti, le password rimangono criptate per sicurezza. Questo significa che anche se qualcuno ruba il file esportato, **non può leggere le password** senza la tua master password.

---

## Metodo 1: Tool Web Offline (Raccomandato) ⚡

### Passo 1: Apri il Tool di Decrittazione

**URL**: `https://TUO_DOMINIO_VERCEL.app/decrypt.html`

Oppure apri localmente: `/app/vercel-app/public/decrypt.html` nel browser

### Passo 2: Inserisci i Dati

1. **Master Password**: La tua password principale SafePass
2. **Username**: Il tuo username SafePass
3. **Password Criptata**: Copia dal file esportato

### Passo 3: Decripta

- **Singola Password**: Incolla e clicca "Decripta Password"
- **File Completo**: Carica il CSV e clicca "Decripta File CSV"

✅ Tutte le password decriptate appariranno in chiaro!

---

## Metodo 2: Console Browser (Per Sviluppatori)

### Passo 1: Apri Console Browser

- Chrome/Edge: `F12` → Console
- Firefox: `Ctrl+Shift+K`
- Safari: `Cmd+Option+C`

### Passo 2: Copia e Incolla Questo Codice

```javascript
// Web Crypto API Utilities
function str2ab(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function ab2str(buffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

function hex2ab(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function deriveKey(masterPassword, username) {
  const encoder = new TextEncoder();
  const salt = `safepass-${username || 'default'}`;
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

async function decryptPassword(encryptedData, masterPassword, username) {
  try {
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = hex2ab(ivHex);
    const encrypted = hex2ab(encryptedHex);
    
    const key = await deriveKey(masterPassword, username);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return ab2str(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// USO: Decripta una password
// decryptPassword('IV:ENCRYPTED', 'tua_master_password', 'tuo_username').then(console.log);
```

### Passo 3: Usa la Funzione

```javascript
// Esempio:
decryptPassword(
  'C1E22D2D7435D9B3:903FEECB4E6E105E...',  // Password criptata dal CSV
  'MiaMasterPassword',                      // Tua master password
  'mio_username'                            // Tuo username
).then(password => {
  console.log('Password decriptata:', password);
});
```

---

## Metodo 3: Script Python (Avanzato)

### Installa Dipendenze

```bash
pip install pycryptodome
```

### Script Python

```python
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
import binascii

def decrypt_password(encrypted_data, master_password, username):
    # Parse IV and encrypted data
    iv_hex, encrypted_hex = encrypted_data.split(':')
    iv = binascii.unhexlify(iv_hex)
    encrypted = binascii.unhexlify(encrypted_hex)
    
    # Derive key
    salt = f'safepass-{username or "default"}'.encode('utf-8')
    key = PBKDF2(master_password.encode('utf-8'), salt, dkLen=32, count=100000)
    
    # Decrypt
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    decrypted = cipher.decrypt_and_verify(encrypted[:-16], encrypted[-16:])
    
    return decrypted.decode('utf-8')

# Uso
encrypted = "C1E22D2D7435D9B3:903FEECB4E6E105E..."
master_password = "MiaMasterPassword"
username = "mio_username"

password = decrypt_password(encrypted, master_password, username)
print(f"Password decriptata: {password}")
```

---

## Metodo 4: Decritta File CSV Completo

### Python Script per CSV

```python
import csv
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
import binascii

def decrypt_password(encrypted_data, master_password, username):
    if ':' not in encrypted_data:
        return encrypted_data  # Already plain text
    
    try:
        iv_hex, encrypted_hex = encrypted_data.split(':')
        iv = binascii.unhexlify(iv_hex)
        encrypted = binascii.unhexlify(encrypted_hex)
        
        salt = f'safepass-{username or "default"}'.encode('utf-8')
        key = PBKDF2(master_password.encode('utf-8'), salt, dkLen=32, count=100000)
        
        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        decrypted = cipher.decrypt_and_verify(encrypted[:-16], encrypted[-16:])
        
        return decrypted.decode('utf-8')
    except Exception as e:
        return f"ERROR: {str(e)}"

# Configurazione
MASTER_PASSWORD = "TuaMasterPassword"
USERNAME = "TuoUsername"
INPUT_FILE = "safepass_export.csv"
OUTPUT_FILE = "safepass_decrypted.csv"

# Leggi e decripta
with open(INPUT_FILE, 'r', encoding='utf-8') as infile:
    reader = csv.DictReader(infile)
    rows = list(reader)
    
    # Decripta tutte le password
    for row in rows:
        if 'encrypted_password' in row:
            row['decrypted_password'] = decrypt_password(
                row['encrypted_password'], 
                MASTER_PASSWORD, 
                USERNAME
            )

# Salva file decriptato
with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as outfile:
    fieldnames = list(rows[0].keys()) if rows else []
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ File decriptato salvato in: {OUTPUT_FILE}")
```

---

## Formato Password Criptate

Le password criptate hanno questo formato:

```
IV:ENCRYPTED_DATA
```

- **IV** (Initialization Vector): 24 caratteri hex
- **ENCRYPTED_DATA**: Dati criptati in hex

**Esempio**:
```
C1E22D2D7435D9B3:903FEECB4E6E105E3366719D...
```

---

## Algoritmo di Crittografia

SafePass usa:

- **AES-GCM** (256-bit)
- **PBKDF2** per key derivation
- **100,000 iterazioni**
- **Salt**: `safepass-{username}`

---

## Troubleshooting

### ❌ "Decryption failed"

**Possibili cause:**
1. Master password errata
2. Username errato
3. Password corrotta nel file

**Soluzione:**
- Verifica master password
- Assicurati di usare lo stesso username del login
- Controlla che la password criptata sia completa

### ❌ "Invalid format"

**Causa**: Password non nel formato corretto

**Soluzione**: 
- Verifica che la password contenga `:`
- Assicurati di copiare l'intera stringa

### ❌ Script Python non funziona

**Soluzione**:
```bash
pip install pycryptodome --upgrade
```

---

## Sicurezza

⚠️ **IMPORTANTE**:

1. **Non condividere** file decriptati
2. **Elimina** file decriptati dopo l'uso
3. **Usa solo** su dispositivi fidati
4. **Tool offline** - nessun dato inviato a server

---

## Link Utili

- **Tool Web**: `/decrypt.html` (incluso nell'app)
- **Documentazione**: `README.md`
- **Support**: Issues su GitHub

---

**✅ Ora puoi decrittare le tue password in sicurezza!**
