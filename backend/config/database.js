import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db;
let client;

export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-kpass-00:9RMmpIav4TwJxlpB@kpass-00.pdb463f.mongodb.net/?retryWrites=true&w=majority';
    const dbName = process.env.DB_NAME || 'kpass-00';

    client = new MongoClient(mongoUrl);
    await client.connect();
    
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
  }
};
