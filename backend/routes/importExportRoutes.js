import { authMiddleware } from '../middleware/auth.js';
import { exportPasswords } from '../controllers/importExportController.js';

export default async function importExportRoutes(fastify, options) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.get('/export', exportPasswords);
}