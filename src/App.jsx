import React from 'react';
import { RistrettoProvider, useRistretto } from './context/RistrettoContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Menu from './pages/Menu';
import Gastos from './pages/Gastos';
import Caja from './pages/Caja';
import Login from './pages/Login';

// Inner component to access the context values
function AppContent() {
  const { activeTab, isAuthenticated } = useRistretto();

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
      {/* Lateral navigation menu (hidden on print) */}
      <Sidebar />
      
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
