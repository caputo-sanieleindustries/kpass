import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import importExportRoutes from './routes/importExportRoutes.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Connect to MongoDB
await connectDB();

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(passwordRoutes, { prefix: '/api/passwords' });
fastify.register(importExportRoutes, { prefix: '/api/passwords' });

// Root route
fastify.get('/api', async (request, reply) => {
  return { message: 'SafePass API - Node.js/Fastify' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: 8001, 
      host: '0.0.0.0' 
    });
    console.log('Server running on http://0.0.0.0:8001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();