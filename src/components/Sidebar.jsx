import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  LayoutDashboard, 
  Coffee, 
  BookOpen, 
  TrendingDown, 
  Wallet,
  Database,
  KeyRound,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    cajaActiva, 
    exportData,
    authCredentials,
    logout,
    updateCredentials,
    resetDatos,
    userRole
  } = useRistretto();

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [credentialsError, setCredentialsError] = useState('');

  const handleOpenCredentials = () => {
    setNewUsernameInput(authCredentials.username);
    setNewPasswordInput(authCredentials.password);
    setCredentialsError('');
    setShowCredentialsModal(true);
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (!newUsernameInput.trim() || !newPasswordInput) {
      setCredentialsError('El usuario y contraseña no pueden estar vacíos');
      return;
    }
    updateCredentials(newUsernameInput.trim(), newPasswordInput);
    setShowCredentialsModal(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'admin' },
    { id: 'pos', label: 'Punto de Venta', icon: Coffee, role: 'any' },
    { id: 'menu', label: 'Menú', icon: BookOpen, role: 'any' },
    { id: 'gastos', label: 'Gastos', icon: TrendingDown, role: 'admin' },
    { id: 'caja', label: 'Caja y Arqueo', icon: Wallet, role: 'admin' },
  ].filter(item => item.role === 'any' || userRole === 'admin');

  return (
    <aside className={`no-print sidebar-drawer ${isOpen ? 'open' : ''}`} style={{
      width: '260px',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Logo Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        gap: '12px'
      }}>
        <img 
          src="/logo.jpg" 
          alt="Ristretto Coffee Logo" 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--primary-green)',
            boxShadow: 'var(--shadow-soft)'
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--primary-green)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0
          }}>
            Ristretto Coffee
          </h1>
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            Chapadmalal
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: 1
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary-green)' : 'transparent',
                color: isActive ? 'var(--text-light)' : 'var(--text-dark)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Caja Status & Export */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {userRole === 'admin' && (
          <>
            {/* Caja Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: cajaActiva ? 'rgba(30, 63, 32, 0.06)' : 'rgba(168, 74, 50, 0.06)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: cajaActiva ? 'var(--primary-green)' : 'var(--danger-rust)',
              border: `1px solid ${cajaActiva ? 'rgba(30, 63, 32, 0.1)' : 'rgba(168, 74, 50, 0.1)'}`
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: cajaActiva ? 'var(--primary-green)' : 'var(--danger-rust)',
                display: 'inline-block',
                animation: cajaActiva ? 'pulse 2s infinite' : 'none'
              }}></span>
              {cajaActiva ? 'Caja Abierta' : 'Caja Cerrada'}
            </div>

            {/* Export Backup Button */}
            <button
              onClick={exportData}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Database size={14} />
              Backup Datos
            </button>

            {/* Change Credentials Button */}
            <button
              onClick={handleOpenCredentials}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <KeyRound size={14} />
              Configurar Acceso
            </button>
          </>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="btn btn-danger"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            borderColor: 'var(--danger-rust)',
            color: 'var(--danger-rust)'
          }}
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>

      {/* Credentials Settings Modal */}
      {showCredentialsModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Configurar Acceso</h3>
              <button className="modal-close-btn" onClick={() => setShowCredentialsModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCredentials}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Modificá el usuario o contraseña con el que ingresás al facturador de la cafetería.
                </p>

                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newUsernameInput}
                    onChange={(e) => {
                      setNewUsernameInput(e.target.value);
                      setCredentialsError('');
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Contraseña
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newPasswordInput}
                    onChange={(e) => {
                      setNewPasswordInput(e.target.value);
                      setCredentialsError('');
                    }}
                  />
                </div>

                {credentialsError && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', display: 'block' }}>
                    {credentialsError}
                  </span>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                
                {/* Reset Section (Danger Zone) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--danger-rust)', marginBottom: '6px' }}>
                    Zona de Peligro (Uso Técnico)
                  </label>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Borrara todas las ventas registradas, arqueos, gastos y mesas guardadas de prueba. El menú de productos no se verá afectado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que querés borrar todas las ventas, arqueos y gastos de prueba? Esta acción es irreversible.')) {
                        resetDatos();
                        alert('Datos transaccionales restablecidos con éxito.');
                        setShowCredentialsModal(false);
                      }
                    }}
                    className="btn btn-danger"
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      width: 'auto',
                      backgroundColor: 'transparent',
                      borderColor: 'var(--danger-rust)',
                      color: 'var(--danger-rust)',
                      fontWeight: 600
                    }}
                  >
                    Borrar Datos de Prueba
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCredentialsModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
