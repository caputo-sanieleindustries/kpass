import bcrypt from 'bcrypt';
import { getDB } from '../_lib/db.js';
import { User } from '../_lib/models.js';
import { createToken } from '../_lib/auth.js';
import { generateRecoveryKey, handleCors } from '../_lib/utils.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const { master_username, master_password } = req.body;
    const db = await getDB();

    const existingUser = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (existingUser) {
      return res.status(400).json({
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

    const token = createToken(user.id, user.master_username);

    return res.status(200).json({
      token,
      user_id: user.id,
      master_username: user.master_username,
      recovery_key: recoveryKey
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      detail: error.message
    });
  }
}

export default handleCors(handler);