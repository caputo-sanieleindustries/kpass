import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddPasswordDialog from '../components/AddPasswordDialog';
import EditPasswordDialog from '../components/EditPasswordDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import ImportExportDialog from '../components/ImportExportDialog';
import { encryptPassword, decryptPassword } from '../utils/crypto';

const API = '/api';

export default function Dashboard({ setIsAuthenticated }) {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [deletingPassword, setDeletingPassword] = useState(null);
  const [importExportDialog, setImportExportDialog] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/passwords`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswords(response.data);
    } catch (err) {
      console.error('Error fetching passwords:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleAddPassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const masterPassword = localStorage.getItem('masterPassword');

      // Encrypt password before sending
      const encryptedPassword = await encryptPassword(passwordData.password, masterPassword);

      await axios.post(
        `${API}/passwords`,
        {
          title: passwordData.title,
          email: passwordData.email,
          username: passwordData.username,
          encrypted_password: encryptedPassword,
          url: passwordData.url,
          notes: passwordData.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchPasswords();
      setShowAddDialog(false);
    } catch (err) {
      console.error('Error adding password:', err);
      throw err;
    }
  };

  const handleEditPassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('token');
      const masterPassword = localStorage.getItem('masterPassword');

      // Encrypt password if it was changed
      let updateData = {
        title: passwordData.title,
        email: passwordData.email,
        username: passwordData.username,
        url: passwordData.url,
        notes: passwordData.notes
      };

      if (passwordData.password) {
        updateData.encrypted_password = await encryptPassword(passwordData.password, masterPassword);
      }

      await axios.put(
        `${API}/passwords/${editingPassword.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchPasswords();
      setEditingPassword(null);
    } catch (err) {
      console.error('Error updating password:', err);
      throw err;
    }
  };

  const handleDeletePassword = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/passwords/${deletingPassword.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPasswords();
      setDeletingPassword(null);
    } catch (err) {
      console.error('Error deleting password:', err);
    }
  };

  const toggleRevealPassword = async (passwordId, encryptedPassword) => {
    if (revealedPasswords[passwordId]) {
      // Hide password
      setRevealedPasswords(prev => {
        const newState = { ...prev };
        delete newState[passwordId];
        return newState;
      });
    } else {
      // Reveal password
      try {
        const masterPassword = localStorage.getItem('masterPassword');
        const decrypted = await decryptPassword(encryptedPassword, masterPassword);
        setRevealedPasswords(prev => ({ ...prev, [passwordId]: decrypted }));
      } catch (err) {
        console.error('Error decrypting password:', err);
        alert('Errore nella decrittazione della password');
      }
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copiato negli appunti`);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleImportExportSuccess = (message) => {
    console.log(message);
    fetchPasswords();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ padding: '3rem', textAlign: 'center' }}>Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon" data-testid="dashboard-logo">🔐</div>
          <h1 className="dashboard-title">SafePass</h1>
        </div>
        <div className="dashboard-actions">
          <div className="user-info" data-testid="user-info">👤 {username}</div>
          <button 
            className="btn-secondary" 
            onClick={() => setImportExportDialog('import')}
            data-testid="import-button"
          >
            📥 Importa
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setImportExportDialog('export')}
            data-testid="export-button"
          >
            📤 Esporta
          </button>
          <button className="btn-secondary" onClick={handleLogout} data-testid="logout-button">
            Esci
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h2 className="content-title" data-testid="passwords-title">Le tue password</h2>
          <button className="btn-primary" onClick={() => setShowAddDialog(true)} data-testid="add-password-button">
            + Aggiungi Password
          </button>
        </div>

        {passwords.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-state-icon">🔒</div>
            <h3 className="empty-state-title">Nessuna password salvata</h3>
            <p className="empty-state-text">
              Inizia ad aggiungere le tue password per mantenerle al sicuro
            </p>
            <button className="btn-primary" onClick={() => setShowAddDialog(true)} data-testid="empty-add-button">
              Aggiungi la tua prima password
            </button>
          </div>
        ) : (
          <div className="passwords-grid">
            {passwords.map((pwd) => (
              <div key={pwd.id} className="password-card" data-testid={`password-card-${pwd.id}`}>
                <div className="password-card-header">
                  <div>
                    <h3 className="password-card-title" data-testid={`password-title-${pwd.id}`}>{pwd.title}</h3>
                    {pwd.url && (
                      <a 
                        href={pwd.url.startsWith('http') ? pwd.url : `https://${pwd.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="password-card-url"
                        data-testid={`password-url-${pwd.id}`}
                      >
                        {pwd.url}
                      </a>
                    )}
                  </div>
                  <div className="password-card-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => setEditingPassword(pwd)}
                      data-testid={`edit-button-${pwd.id}`}
                      title="Modifica"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => setDeletingPassword(pwd)}
                      data-testid={`delete-button-${pwd.id}`}
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="password-card-info">
                  {pwd.email && (
                    <div className="password-info-row">
                      <span className="password-info-label">Email:</span>
                      <span className="password-info-value" data-testid={`password-email-${pwd.id}`}>
                        {pwd.email}
                      </span>
                      <button 
                        className="btn-icon" 
                        onClick={() => copyToClipboard(pwd.email, 'Email')}
                        data-testid={`copy-email-${pwd.id}`}
                        title="Copia"
                      >
                        📋
                      </button>
                    </div>
                  )}
                  {pwd.username && (
                    <div className="password-info-row">
                      <span className="password-info-label">Username:</span>
                      <span className="password-info-value" data-testid={`password-username-${pwd.id}`}>
                        {pwd.username}
                      </span>
                      <button 
                        className="btn-icon" 
                        onClick={() => copyToClipboard(pwd.username, 'Username')}
                        data-testid={`copy-username-${pwd.id}`}
                        title="Copia"
                      >
                        📋
                      </button>
                    </div>
                  )}
                  <div className="password-info-row">
                    <span className="password-info-label">Password:</span>
                    <span className="password-info-value" data-testid={`password-value-${pwd.id}`}>
                      {revealedPasswords[pwd.id] ? (
                        revealedPasswords[pwd.id]
                      ) : (
                        <span className="password-hidden">••••••••</span>
                      )}
                    </span>
                    <button 
                      className="btn-icon" 
                      onClick={() => toggleRevealPassword(pwd.id, pwd.encrypted_password)}
                      data-testid={`toggle-password-${pwd.id}`}
                      title={revealedPasswords[pwd.id] ? 'Nascondi' : 'Mostra'}
                    >
                      {revealedPasswords[pwd.id] ? '🙈' : '👁️'}
                    </button>
                    {revealedPasswords[pwd.id] && (
                      <button 
                        className="btn-icon" 
                        onClick={() => copyToClipboard(revealedPasswords[pwd.id], 'Password')}
                        data-testid={`copy-password-${pwd.id}`}
                        title="Copia"
                      >
                        📋
                      </button>
                    )}
                  </div>
                  {pwd.notes && (
                    <div className="password-info-row">
                      <span className="password-info-label">Note:</span>
                      <span className="password-info-value" data-testid={`password-notes-${pwd.id}`}>
                        {pwd.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddDialog && (
        <AddPasswordDialog
          onClose={() => setShowAddDialog(false)}
          onSave={handleAddPassword}
        />
      )}

      {editingPassword && (
        <EditPasswordDialog
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
          onSave={handleEditPassword}
        />
      )}

      {deletingPassword && (
        <DeleteConfirmDialog
          passwordTitle={deletingPassword.title}
          onClose={() => setDeletingPassword(null)}
          onConfirm={handleDeletePassword}
        />
      )}

      {importExportDialog && (
        <ImportExportDialog
          mode={importExportDialog}
          onClose={() => setImportExportDialog(null)}
          onSuccess={handleImportExportSuccess}
        />
      )}
    </div>
  );
}