import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ExportDialog({ onClose, onSuccess }) {
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore durante l\'esportazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">📤 Esporta Password</DialogTitle>
          <DialogDescription>
            Esporta le tue password in formato criptato
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="error-message" data-testid="dialog-error">
            {error}
          </div>
        )}

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

          <div className="info-box">
            <strong>💡 Ricorda:</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Le password sono criptate. Usa il pulsante "🔓 Decripta Password" nella dashboard per decriptarle.
            </p>
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
      </DialogContent>
    </Dialog>
  );
}
