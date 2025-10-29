import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      request.user = decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Token expired'
        });
      }
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};