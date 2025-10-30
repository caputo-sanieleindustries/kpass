import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export default function AddPasswordDialog({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.password) {
      setError('Titolo e password sono obbligatori');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="add-password-dialog" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">Aggiungi Password</DialogTitle>
          <DialogDescription id="dialog-description">
            Compila i campi per salvare una nuova password nel tuo vault
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="error-message" data-testid="dialog-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              data-testid="title-input"
              placeholder="es. Gmail, Facebook..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-testid="email-input"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              data-testid="username-input"
              placeholder="Il tuo username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                data-testid="password-input"
                type="text"
                placeholder="La password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={generatePassword}
                data-testid="generate-password-button"
                variant="outline"
              >
                Genera
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              data-testid="url-input"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              data-testid="notes-input"
              placeholder="Note aggiuntive..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="cancel-button"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              data-testid="save-button"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}