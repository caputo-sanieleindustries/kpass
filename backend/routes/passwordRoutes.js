import { authMiddleware } from '../middleware/auth.js';
import {
  getPasswords,
  createPassword,
  updatePassword,
  deletePassword
} from '../controllers/passwordController.js';

export default async function passwordRoutes(fastify, options) {
  fastify.addHook('onRequest', authMiddleware);

  fastify.get('/', getPasswords);
  fastify.post('/', createPassword);
  fastify.put('/:passwordId', updatePassword);
  fastify.delete('/:passwordId', deletePassword);
}