import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function createToken(userId, username) {
  return jwt.sign(
    { user_id: userId, master_username: username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authMiddleware(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        detail: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        detail: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    return handler(req, res);
  };
}