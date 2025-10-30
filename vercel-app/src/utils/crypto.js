/**
 * Crypto utilities for client-side encryption/decryption
 * Uses Web Crypto API with AES-GCM
 */

// Convert string to ArrayBuffer
function str2ab(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert ArrayBuffer to string
function ab2str(buffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert ArrayBuffer to hex string
function ab2hex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to ArrayBuffer
function hex2ab(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Derive encryption key from master password using PBKDF2
async function deriveKey(masterPassword, salt) {
  const encoder = new TextEncoder();
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
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a password using master password
 * @param {string} password - The password to encrypt
 * @param {string} masterPassword - The master password for key derivation
 * @returns {Promise<string>} - Encrypted password in format: iv:encrypted
 */
export async function encryptPassword(password, masterPassword) {
  try {
    // Use a static salt derived from username for consistency
    // In production, you might want to store salt per user
    const username = localStorage.getItem('username') || 'default';
    const salt = `safepass-${username}`;

    // Derive key from master password
    const key = await deriveKey(masterPassword, salt);

    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt password
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      str2ab(password)
    );

    // Return iv:encrypted format
    return `${ab2hex(iv)}:${ab2hex(encrypted)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Errore durante la crittografia');
  }
}

/**
 * Decrypt a password using master password
 * @param {string} encryptedData - The encrypted data in format: iv:encrypted
 * @param {string} masterPassword - The master password for key derivation
 * @returns {Promise<string>} - Decrypted password
 */
export async function decryptPassword(encryptedData, masterPassword) {
  try {
    // Parse iv and encrypted data
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = hex2ab(ivHex);
    const encrypted = hex2ab(encryptedHex);

    // Use the same salt
    const username = localStorage.getItem('username') || 'default';
    const salt = `safepass-${username}`;

    // Derive key from master password
    const key = await deriveKey(masterPassword, salt);

    // Decrypt password
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return ab2str(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Errore durante la decrittografia');
  }
}