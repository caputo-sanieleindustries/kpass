import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_URL;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db('kpass-00');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export async function getDB() {
  const { db } = await connectToDatabase();
  return db;
}
