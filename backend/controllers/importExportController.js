import { getDB } from '../config/database.js';
import { PasswordEntry } from '../models/PasswordEntry.js';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import XLSX from 'xlsx';
import xml2js from 'xml2js';

export const importPasswords = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const data = await request.file();
    const db = getDB();

    if (!data) {
      return reply.code(400).send({
        detail: 'No file uploaded'
      });
    }

    const buffer = await data.toBuffer();
    const filename = data.filename;
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
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const records = XLSX.utils.sheet_to_json(worksheet);
      importedCount = await processImportRecords(records, userId, db);
    } else if (extension === 'xml') {
      const xmlString = buffer.toString();
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlString);

      let entries = [];
      if (result.passwords && result.passwords.entry) {
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
      return reply.code(400).send({
        detail: 'Unsupported file format'
      });
    }

    return reply.send({
      message: `Successfully imported ${importedCount} passwords`
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({
      detail: `Error importing file: ${error.message}`
    });
  }
};

const processImportRecords = async (records, userId, db) => {
  let importedCount = 0;
  
  // Mapping completo per tutti i formati popolari
  const fieldMappings = {
    // Title/Name mappings
    title: ['title', 'name', 'site', 'website', 'service', 'account', 'item'],
    // Email mappings  
    email: ['email', 'e-mail', 'mail', 'emailaddress', 'useremail'],
    // Username mappings
    username: ['username', 'user', 'login', 'username', 'accountname', 'loginname'],
    // Password mappings
    password: ['password', 'pass', 'encryptedpassword', 'encrypted_password', 'pwd'],
    // URL mappings
    url: ['url', 'website', 'site', 'web', 'link', 'address', 'host', 'domain'],
    // Notes mappings
    notes: ['notes', 'note', 'extra', 'comment', 'comments', 'description', 'memo', 'grouping', 'folder', 'category']
  };

  // Normalize all records
  const normalizedRecords = records.map(record => {
    const normalized = {};
    for (const [key, value] of Object.entries(record)) {
      // Remove spaces, underscores, dashes and lowercase
      const normalizedKey = key.toLowerCase().trim().replace(/[_\s-]/g, '');
      normalized[normalizedKey] = value;
    }
    return { original: record, normalized };
  });

  for (const { original, normalized } of normalizedRecords) {
    // Smart field extraction
    const extractField = (mappingArray) => {
      for (const possibleKey of mappingArray) {
        const searchKey = possibleKey.toLowerCase().replace(/[_\s-]/g, '');
        if (normalized[searchKey] && normalized[searchKey] !== '') {
          return normalized[searchKey];
        }
      }
      return null;
    };

    const title = extractField(fieldMappings.title);
    const email = extractField(fieldMappings.email);
    const username = extractField(fieldMappings.username);
    const password = extractField(fieldMappings.password);
    const url = extractField(fieldMappings.url);
    const notes = extractField(fieldMappings.notes);

    // Skip if no essential data
    if (!title && !url && !password) {
      continue;
    }

    // Check if password is in plaintext (not encrypted)
    let finalPassword = password || '';
    let finalNotes = notes || '';
    
    if (finalPassword && !finalPassword.includes(':') && finalPassword.length < 100) {
      // Probably plaintext - add warning
      const warningNote = '⚠️ ATTENZIONE: Password importata in chiaro. Considera di ri-criptarla.';
      finalNotes = finalNotes ? `${finalNotes}\n\n${warningNote}` : warningNote;
    }

    const passwordEntry = new PasswordEntry({
      user_id: userId,
      title: title || url || 'Imported Entry',
      email: email || null,
      username: username || null,
      encrypted_password: finalPassword,
      url: url || null,
      notes: finalNotes || null
    });

    await db.collection('password_entries').insertOne(passwordEntry.toJSON());
    importedCount++;
  }

  return importedCount;
};

export const exportPasswords = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const format = request.query.format || 'csv';
    const db = getDB();

    const passwords = await db.collection('password_entries')
      .find({ user_id: userId }, { projection: { _id: 0 } })
      .toArray();

    if (passwords.length === 0) {
      return reply.code(404).send({
        detail: 'No passwords to export'
      });
    }

    const exportData = passwords.map(pwd => ({
      title: pwd.title || '',
      email: pwd.email || '',
      username: pwd.username || '',
      encrypted_password: pwd.encrypted_password || '',
      url: pwd.url || '',
      notes: pwd.notes || ''
    }));

    if (format === 'csv') {
      const csv = stringify(exportData, {
        header: true,
        columns: ['title', 'email', 'username', 'encrypted_password', 'url', 'notes']
      });

      return reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename=safepass_export.csv')
        .send(csv);
    } else if (format === 'xlsx' || format === 'xlsm') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Passwords');

      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: format
      });

      const mimeType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel.sheet.macroEnabled.12';

      return reply
        .header('Content-Type', mimeType)
        .header('Content-Disposition', `attachment; filename=safepass_export.${format}`)
        .send(buffer);
    } else if (format === 'xml') {
      const builder = new xml2js.Builder({
        rootName: 'passwords',
        xmldec: { version: '1.0', encoding: 'UTF-8' }
      });

      const xmlData = {
        entry: exportData.map(entry => ({
          title: entry.title,
          email: entry.email,
          username: entry.username,
          encrypted_password: entry.encrypted_password,
          url: entry.url,
          notes: entry.notes
        }))
      };

      const xml = builder.buildObject(xmlData);

      return reply
        .header('Content-Type', 'application/xml')
        .header('Content-Disposition', 'attachment; filename=safepass_export.xml')
        .send(xml);
    } else {
      return reply.code(400).send({
        detail: 'Unsupported export format'
      });
    }
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      detail: error.message
    });
  }
};