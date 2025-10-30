import { getDB } from '../_lib/db.js';
import { authMiddleware } from '../_lib/auth.js';
import { handleCors } from '../_lib/utils.js';
import { stringify } from 'csv-stringify/sync';
import XLSX from 'xlsx';
import xml2js from 'xml2js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const db = await getDB();
  const userId = req.user.user_id;
  const format = req.query.format || 'csv';

  try {
    const passwords = await db.collection('password_entries')
      .find({ user_id: userId }, { projection: { _id: 0 } })
      .toArray();

    if (passwords.length === 0) {
      return res.status(404).json({ detail: 'No passwords to export' });
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
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=safepass_export.csv');
      return res.status(200).send(csv);
    } else if (format === 'xlsx' || format === 'xlsm') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Passwords');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: format });
      
      const mimeType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel.sheet.macroEnabled.12';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=safepass_export.${format}`);
      return res.status(200).send(buffer);
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
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename=safepass_export.xml');
      return res.status(200).send(xml);
    } else {
      return res.status(400).json({ detail: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ detail: error.message });
  }
}

export default handleCors(authMiddleware(handler));