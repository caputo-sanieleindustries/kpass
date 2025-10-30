import crypto from 'crypto';

export function generateRecoveryKey() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return parts.join('-');
}

export function setCorsHeaders(res) {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleCors(handler) {
  return async (req, res) => {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
}