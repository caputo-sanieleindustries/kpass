import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = 'mongodb+srv://Vercel-Admin-kpass-00:9RMmpIav4TwJxlpB@kpass-00.pdb463f.mongodb.net/?retryWrites=true&w=majority'/*process.env.REACT_APP_BACKEND_URL*/;
const API = `${BACKEND_URL}/api`;

export default function RecoverPage() {
  const [username, setUsername] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nuova password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/recover`, {
        master_username: username,
        recovery_key: recoveryKey,
        new_master_password: newPassword
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Recupero password fallito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" data-testid="recover-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon" data-testid="logo-icon">🔑</div>
        </div>
        <h1 className="auth-title" data-testid="recover-title">Recupera Password</h1>
        <p className="auth-subtitle" data-testid="recover-subtitle">
          Usa la tua chiave di recupero per reimpostare la master password
        </p>

        {error && (
          <div className="error-message" data-testid="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" data-testid="success-message">
            Password reimpostata con successo! Reindirizzamento al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              data-testid="username-input"
              type="text"
              className="form-input"
              placeholder="Il tuo username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="recoveryKey">Chiave di Recupero</label>
            <input
              id="recoveryKey"
              data-testid="recovery-key-input"
              type="text"
              className="form-input"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={recoveryKey}
              onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">Nuova Master Password</label>
            <input
              id="newPassword"
              data-testid="new-password-input"
              type="password"
              className="form-input"
              placeholder="Minimo 8 caratteri"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Conferma Password</label>
            <input
              id="confirmPassword"
              data-testid="confirm-password-input"
              type="password"
              className="form-input"
              placeholder="Ripeti la nuova password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            data-testid="recover-button"
            disabled={loading || success}
          >
            {loading ? 'Recupero in corso...' : 'Reimposta Password'}
          </button>
        </form>

        <div className="auth-link">
          Ricordi la password? <Link to="/login" data-testid="login-link">Accedi</Link>
        </div>
      </div>
    </div>
  );
}