import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ImportExportDialog({ mode, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xml', 'xlsx', 'xlsm'].includes(extension)) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Formato file non supportato. Usa CSV, XML, XLSX o XLSM.');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Seleziona un file da importare');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API}/passwords/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess(response.data.message);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore durante l\'importazione');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/passwords/export?format=${exportFormat}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `safepass_export.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onSuccess('Export completato con successo');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore durante l\'esportazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="import-export-dialog">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {mode === 'import' ? '📥 Importa Password' : '📤 Esporta Password'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'import' 
              ? 'Carica un file CSV, XML, XLSX o XLSM con le tue password. Supporta formati da 1Password, LastPass e altri.'
              : 'Esporta le tue password in formato criptato. Avrai bisogno della master password per decriptarle.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="error-message" data-testid="dialog-error">
            {error}
          </div>
        )}

        {mode === 'import' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Seleziona File</Label>
              <input
                id="file"
                data-testid="file-input"
                type="file"
                accept=".csv,.xml,.xlsx,.xlsm"
                onChange={handleFileChange}
                className="form-input"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600" data-testid="selected-file">
                  File selezionato: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="info-box">
              <strong>Formati supportati:</strong>
              <ul className="text-sm mt-2">
                <li>• CSV - 1Password, LastPass, formato generico</li>
                <li>• XML - Formato strutturato</li>
                <li>• XLSX/XLSM - Excel</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                data-testid="cancel-button"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleImport}
                disabled={loading || !selectedFile}
                data-testid="import-button"
              >
                {loading ? 'Importazione...' : 'Importa'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Formato Esportazione</Label>
              <div className="format-options" data-testid="format-options">
                {['csv', 'xml', 'xlsx', 'xlsm'].map(format => (
                  <label key={format} className="format-option">
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={exportFormat === format}
                      onChange={(e) => setExportFormat(e.target.value)}
                      data-testid={`format-${format}`}
                    />
                    <span>{format.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="warning-box">
              <strong>⚠️ Nota:</strong> Le password esportate sono criptate. Per decriptarle avrai bisogno della tua master password.
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                data-testid="cancel-button"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleExport}
                disabled={loading}
                data-testid="export-button"
              >
                {loading ? 'Esportazione...' : 'Esporta'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}