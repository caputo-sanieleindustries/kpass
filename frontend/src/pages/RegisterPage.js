import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecoveryKeyDialog from '../components/RecoveryKeyDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RegisterPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (password.length < 8) {
      setError('La master password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        master_username: username,
        master_password: password
      });

      // Store recovery key and show dialog
      setRecoveryKey(response.data.recovery_key);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrazione fallita');
      setLoading(false);
    }
  };

  const handleRecoveryKeySaved = async () => {
    // Now get the token by making the actual login
    try {
      const response = await axios.post(`${API}/auth/login`, {
        master_username: username,
        master_password: password
      });

      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('username', response.data.master_username);
      localStorage.setItem('masterPassword', password);

      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError('Errore durante il login automatico');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" data-testid="register-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon" data-testid="logo-icon">🔐</div>
        </div>
        <h1 className="auth-title" data-testid="register-title">Crea il tuo account</h1>
        <p className="auth-subtitle" data-testid="register-subtitle">
          Scegli una master password forte che ricorderai
        </p>

        {error && (
          <div className="error-message" data-testid="error-message">
            {error}
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
              placeholder="Scegli un username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Master Password</label>
            <input
              id="password"
              data-testid="password-input"
              type="password"
              className="form-input"
              placeholder="Minimo 8 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder="Ripeti la master password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            data-testid="register-button"
            disabled={loading}
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <div className="auth-link">
          Hai già un account? <Link to="/login" data-testid="login-link">Accedi</Link>
        </div>
      </div>

      {recoveryKey && (
        <RecoveryKeyDialog
          recoveryKey={recoveryKey}
          username={username}
          onConfirm={() => handleRecoveryKeySaved({ 
            token: recoveryKey, 
            user_id: '', 
            master_username: username 
          })}
        />
      )}
    </div>
  );
}