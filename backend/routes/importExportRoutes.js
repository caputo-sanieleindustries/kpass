import { authMiddleware } from '../middleware/auth.js';
import { importPasswords, exportPasswords } from '../controllers/importExportController.js';

export default async function importExportRoutes(fastify, options) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.post('/import', importPasswords);
  fastify.get('/export', exportPasswords);
}