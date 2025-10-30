import { getDB } from '../_lib/db.js';
import { PasswordEntry } from '../_lib/models.js';
import { authMiddleware } from '../_lib/auth.js';
import { handleCors } from '../_lib/utils.js';
import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';
import xml2js from 'xml2js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const db = await getDB();
  const userId = req.user.user_id;

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    const buffer = fs.readFileSync(file.filepath);
    const filename = file.originalFilename;
    const extension = filename.split('.').pop().toLowerCase();

    let importedCount = 0;

    if (extension === 'csv') {
      const records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      importedCount = await processImportRecords(records, userId, db);
    } else if (extension === 'xlsx' || extension === 'xlsm') {
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json(worksheet);
      importedCount = await processImportRecords(records, userId, db);
    } else if (extension === 'xml') {
      const xmlString = buffer.toString();
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlString);
      
      let entries = [];
      if (result.passwords?.entry) {
        entries = Array.isArray(result.passwords.entry)
          ? result.passwords.entry
          : [result.passwords.entry];
      }

      for (const entry of entries) {
        const passwordEntry = new PasswordEntry({
          user_id: userId,
          title: entry.title?.[0] || entry.name?.[0] || 'Untitled',
          email: entry.email?.[0] || null,
          username: entry.username?.[0] || null,
          encrypted_password: entry.encrypted_password?.[0] || entry.password?.[0] || '',
          url: entry.url?.[0] || null,
          notes: entry.notes?.[0] || entry.extra?.[0] || null
        });
        await db.collection('password_entries').insertOne(passwordEntry.toJSON());
        importedCount++;
      }
    } else {
      return res.status(400).json({ detail: 'Unsupported file format' });
    }

    fs.unlinkSync(file.filepath);
    return res.status(200).json({
      message: `Successfully imported ${importedCount} passwords`
    });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(400).json({ detail: `Error importing file: ${error.message}` });
  }
}

async function processImportRecords(records, userId, db) {
  let importedCount = 0;
  const normalizedRecords = records.map(record => {
    const normalized = {};
    for (const [key, value] of Object.entries(record)) {
      normalized[key.toLowerCase().trim()] = value;
    }
    return normalized;
  });

  for (const record of normalizedRecords) {
    if (!record.title && !record.name && !record.url) continue;

    const passwordEntry = new PasswordEntry({
      user_id: userId,
      title: record.title || record.name || 'Untitled',
      email: record.email || null,
      username: record.username || null,
      encrypted_password: record.encrypted_password || record.password || '',
      url: record.url || record.website || null,
      notes: record.notes || record.extra || null
    });

    await db.collection('password_entries').insertOne(passwordEntry.toJSON());
    importedCount++;
  }

  return importedCount;
}

export default handleCors(authMiddleware(handler));