import bcrypt from 'bcrypt';
import { getDB } from '../_lib/db.js';
import { handleCors } from '../_lib/utils.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const { master_username, recovery_key, new_master_password } = req.body;
    const db = await getDB();

    const user = await db.collection('users').findOne(
      { master_username },
      { projection: { _id: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        detail: 'User not found'
      });
    }

    const isValidRecoveryKey = await bcrypt.compare(
      recovery_key,
      user.recovery_key_hash
    );

    if (!isValidRecoveryKey) {
      return res.status(401).json({
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

    return res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Recover error:', error);
    return res.status(500).json({
      detail: error.message
    });
  }
}

export default handleCors(handler);