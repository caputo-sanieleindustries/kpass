import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDB } from '../config/database.js';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

const generateRecoveryKey = () => {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return parts.join('-');
};

const createJWTToken = (userId, username) => {
  return jwt.sign(
    { user_id: userId, master_username: username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

export const register = async (request, reply) => {
  try {
    const { master_username, master_password } = request.body;
    const db = getDB();

    const existingUser = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (existingUser) {
      return reply.code(400).send({
        detail: 'Username already exists'
      });
    }

    const recoveryKey = generateRecoveryKey();
    const salt = await bcrypt.genSalt(10);
    const recoverySalt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(master_password, salt);
    const recoveryKeyHash = await bcrypt.hash(recoveryKey, recoverySalt);

    const user = new User({
      master_username,
      master_password_hash: passwordHash,
      salt,
      recovery_key_hash: recoveryKeyHash
    });

    await db.collection('users').insertOne(user.toJSON());

    const token = createJWTToken(user.id, user.master_username);

    return reply.send({
      token,
      user_id: user.id,
      master_username: user.master_username,
      recovery_key: recoveryKey
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};

export const login = async (request, reply) => {
  try {
    const { master_username, master_password } = request.body;
    const db = getDB();

    const user = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (!user) {
      return reply.code(401).send({
        detail: 'Invalid username or password'
      });
    }

    const isValidPassword = await bcrypt.compare(
      master_password,
      user.master_password_hash
    );

    if (!isValidPassword) {
      return reply.code(401).send({
        detail: 'Invalid username or password'
      });
    }

    const token = createJWTToken(user.id, user.master_username);

    return reply.send({
      token,
      user_id: user.id,
      master_username: user.master_username
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};

export const recover = async (request, reply) => {
  try {
    const { master_username, recovery_key, new_master_password } = request.body;
    const db = getDB();

    const user = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (!user) {
      return reply.code(404).send({
        detail: 'User not found'
      });
    }

    const isValidRecoveryKey = await bcrypt.compare(
      recovery_key,
      user.recovery_key_hash
    );

    if (!isValidRecoveryKey) {
      return reply.code(401).send({
        detail: 'Invalid recovery key'
      });
    }

    const newSalt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_master_password, newSalt);

    await db.collection('users').updateOne(
      { master_username },
      {
        $set: {
          master_password_hash: newPasswordHash,
          salt: newSalt
        }
      }
    );

    return reply.send({
      message: 'Password reset successfully'
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};