import React, { useState } from 'react';
import { RistrettoProvider, useRistretto } from './context/RistrettoContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Menu from './pages/Menu';
import Gastos from './pages/Gastos';
import Caja from './pages/Caja';
import Login from './pages/Login';
import { Menu as MenuIcon } from 'lucide-react';

// Inner component to access the context values
function AppContent() {
  const { activeTab, isAuthenticated } = useRistretto();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'menu':
        return <Menu />;
      case 'gastos':
        return <Gastos />;
      case 'caja':
        return <Caja />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="no-print mobile-header" style={{
        height: '60px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-green)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MenuIcon size={24} />
        </button>
        <span style={{
          fontFamily: 'var(--font-title)',
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--primary-green)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Ristretto Coffee
        </span>
        <div style={{ width: '40px' }}></div> {/* Spacer to center the title */}
      </header>

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop no-print" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Lateral navigation menu (hidden on print) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main viewport area (scrolls independently) */}
      <main style={{
        flex: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {renderActivePage()}
      </main>
    </>
  );
}

function App() {
  return (
    <RistrettoProvider>
      <AppContent />
    </RistrettoProvider>
  );
}

export default App;
