import bcrypt from 'bcrypt';
import { getDB } from '../_lib/db.js';
import { createToken } from '../_lib/auth.js';
import { handleCors } from '../_lib/utils.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const { master_username, master_password } = req.body;
    const db = await getDB();

    const user = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (!user) {
      return res.status(401).json({
        detail: 'Invalid username or password'
      });
    }

    const isValidPassword = await bcrypt.compare(
      master_password,
      user.master_password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        detail: 'Invalid username or password'
      });
    }

    const token = createToken(user.id, user.master_username);

    return res.status(200).json({
      token,
      user_id: user.id,
      master_username: user.master_username
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      detail: error.message
    });
  }
}

export default handleCors(handler);