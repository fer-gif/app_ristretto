import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useRistretto();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Por favor, ingresá usuario y contraseña');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-sand)',
      backgroundImage: `
        linear-gradient(to right, rgba(30, 63, 32, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(30, 63, 32, 0.035) 1px, transparent 1px)
      `,
      backgroundSize: '32px 32px',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-medium)'
      }}>
        {/* Logo and Titles */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Ristretto Coffee Logo" 
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary-green)',
              boxShadow: 'var(--shadow-soft)'
            }}
          />
          <div>
            <h2 style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--primary-green)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              margin: 0
            }}>
              Ristretto Coffee
            </h2>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              Ingreso al Facturador
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'rgba(168, 74, 50, 0.08)',
              border: '1px solid rgba(168, 74, 50, 0.15)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-rust)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                className="input"
                placeholder="Ingrese su usuario..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                style={{ paddingLeft: '40px' }}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                className="input"
                placeholder="Ingrese su contraseña..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px', boxShadow: 'var(--shadow-medium)' }}
          >
            Ingresar al Sistema
          </button>
        </form>

        {/* Credentials Help Banner */}
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: 'rgba(30, 63, 32, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          <strong>Credenciales por defecto del local:</strong><br />
          Usuario: <code style={{ fontSize: '11px', padding: '2px 4px' }}>admin</code> | Clave: <code style={{ fontSize: '11px', padding: '2px 4px' }}>ristretto.chapa</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
