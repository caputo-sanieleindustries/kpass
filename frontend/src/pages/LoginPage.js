import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = 'mongodb+srv://Vercel-Admin-kpass-00:9RMmpIav4TwJxlpB@kpass-00.pdb463f.mongodb.net/?retryWrites=true&w=majority'/*process.env.REACT_APP_BACKEND_URL*/;
const API = `${BACKEND_URL}/api`;

export default function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        master_username: username,
        master_password: password
      });

      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('username', response.data.master_username);
      localStorage.setItem('masterPassword', password); // Store for encryption

      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" data-testid="login-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-icon" data-testid="logo-icon">🔐</div>
        </div>
        <h1 className="auth-title" data-testid="login-title">Accedi a SafePass</h1>
        <p className="auth-subtitle" data-testid="login-subtitle">
          Inserisci la tua master password per accedere
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
              placeholder="Il tuo username"
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
              placeholder="La tua master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            data-testid="login-button"
            disabled={loading}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="auth-link">
          Non hai un account? <Link to="/register" data-testid="register-link">Registrati</Link>
          {' · '}
          <Link to="/recover" data-testid="recover-link">Password dimenticata?</Link>
        </div>
      </div>
    </div>
  );
}