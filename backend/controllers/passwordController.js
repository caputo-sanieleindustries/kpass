import { getDB } from '../config/database.js';
import { PasswordEntry } from '../models/PasswordEntry.js';

export const getPasswords = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const db = getDB();

    const passwords = await db.collection('password_entries')
      .find({ user_id: userId }, { projection: { _id: 0 } })
      .toArray();

    return reply.send(passwords);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};

export const createPassword = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const passwordData = request.body;
    const db = getDB();

    const passwordEntry = new PasswordEntry({
      ...passwordData,
      user_id: userId
    });

    await db.collection('password_entries').insertOne(passwordEntry.toJSON());

    return reply.send(passwordEntry.toJSON());
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};

export const updatePassword = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const { passwordId } = request.params;
    const updateData = request.body;
    const db = getDB();

    const existing = await db.collection('password_entries').findOne(
      { id: passwordId, user_id: userId },
      { projection: { _id: 0 } }
    );

    if (!existing) {
      return reply.code(404).send({
        detail: 'Password entry not found'
      });
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

    return reply.send(updated);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};

export const deletePassword = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const { passwordId } = request.params;
    const db = getDB();

    const result = await db.collection('password_entries').deleteOne({
      id: passwordId,
      user_id: userId
    });

    if (result.deletedCount === 0) {
      return reply.code(404).send({
        detail: 'Password entry not found'
      });
    }

    return reply.send({
      message: 'Password deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};