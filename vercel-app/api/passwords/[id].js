import { getDB } from '../_lib/db.js';
import { authMiddleware } from '../_lib/auth.js';
import { handleCors } from '../_lib/utils.js';

async function handler(req, res) {
  const db = await getDB();
  const userId = req.user.user_id;
  const passwordId = req.query.id;

  try {
    if (req.method === 'PUT') {
      const updateData = req.body;
      const existing = await db.collection('password_entries').findOne(
        { id: passwordId, user_id: userId },
        { projection: { _id: 0 } }
      );

      if (!existing) {
        return res.status(404).json({ detail: 'Password entry not found' });
      }

      const updatedData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      await db.collection('password_entries').updateOne(
        { id: passwordId, user_id: userId },
        { $set: updatedData }
      );

      const updated = await db.collection('password_entries').findOne(
        { id: passwordId },
        { projection: { _id: 0 } }
      );

      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const result = await db.collection('password_entries').deleteOne({
        id: passwordId,
        user_id: userId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ detail: 'Password entry not found' });
      }

      return res.status(200).json({ message: 'Password deleted successfully' });
    }

    return res.status(405).json({ detail: 'Method not allowed' });
  } catch (error) {
    console.error('Password update/delete error:', error);
    return res.status(500).json({ detail: error.message });
  }
}

export default handleCors(authMiddleware(handler));