import { getDB } from '../config/database.js';
import { stringify } from 'csv-stringify/sync';
import XLSX from 'xlsx';
import xml2js from 'xml2js';

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