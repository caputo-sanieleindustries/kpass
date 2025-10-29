import { register, login, recover } from '../controllers/authController.js';

export default async function authRoutes(fastify, options) {
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.post('/recover', recover);
}