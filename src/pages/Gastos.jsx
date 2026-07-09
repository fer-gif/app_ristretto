import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  Plus, 
  Trash2, 
  Search, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const Gastos = () => {
  const { 
    gastos, 
    addGasto, 
    deleteGasto, 
    cajaActiva 
  } = useRistretto();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    monto: '',
    categoria: 'Insumos',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 10),
    cajaAfectada: false
  });

  const [formErrors, setFormErrors] = useState({});

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  const categories = ['Todos', 'Insumos', 'Servicios', 'Sueldos', 'Alquiler', 'Varios'];
  const formCategories = ['Insumos', 'Servicios', 'Sueldos', 'Alquiler', 'Varios'];

  // Filter Expenses
  const filteredGastos = gastos.filter(g => {
    const matchesSearch = g.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || g.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const totalGastosToday = gastos
    .filter(g => g.fecha.startsWith(todayStr))
    .reduce((acc, g) => acc + g.monto, 0);

  const totalGastosMonth = gastos
    .filter(g => g.fecha.startsWith(currentMonthStr))
    .reduce((acc, g) => acc + g.monto, 0);

  // Open modal
  const handleOpenAdd = () => {
    setFormData({
      monto: '',
      categoria: 'Insumos',
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
      cajaAfectada: !!cajaActiva // default to true if box is open
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.monto || parseFloat(formData.monto) <= 0) errors.monto = 'El monto debe ser mayor a 0';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria';
    if (!formData.fecha) errors.fecha = 'La fecha es obligatoria';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addGasto({
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
      descripcion: formData.descripcion.trim(),
      fecha: formData.fecha,
      cajaAfectada: cajaActiva ? formData.cajaAfectada : false
    });

    setShowAddModal(false);
  };

  // Category badge style selector
  const getBadgeClass = (category) => {
    switch (category) {
      case 'Insumos': return 'badge-green';
      case 'Servicios': return 'badge-gold';
      case 'Sueldos': return 'badge-green';
      case 'Alquiler': return 'badge-gold';
      default: return 'badge-rust';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            fontSize: '1.8rem',
            color: 'var(--primary-green)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Control de Gastos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            Registrá compras de mercadería, pago de servicios, alquileres y otros egresos
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
          Registrar Gasto
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Gastos de Hoy */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(168, 74, 50, 0.08)',
            color: 'var(--danger-rust)'
          }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gastos de Hoy</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {formatCurrency(totalGastosToday)}
            </h3>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(168, 74, 50, 0.08)',
            color: 'var(--danger-rust)'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gastos del Mes</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {formatCurrency(totalGastosMonth)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            className="input"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: selectedCategory === cat ? 'rgba(30, 63, 32, 0.08)' : 'transparent',
                color: selectedCategory === cat ? 'var(--primary-green)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List Table Card */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.95rem'
        }}>
          <thead>
            <tr style={{
              backgroundColor: 'rgba(30, 63, 32, 0.02)',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              <th style={{ padding: '16px 24px' }}>Fecha</th>
              <th style={{ padding: '16px 24px' }}>Descripción</th>
              <th style={{ padding: '16px 24px' }}>Categoría</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>¿Pago desde Caja?</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Monto</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGastos.length === 0 ? (
              <tr>
                <td colSpan="6" style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                  color: 'var(--text-muted)'
                }}>
                  No se registraron gastos.
                </td>
              </tr>
            ) : (
              filteredGastos.map(g => (
                <tr key={g.id} style={{
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color var(--transition-fast)'
                }} className="table-row-hover">
                  
                  {/* Date */}
                  <td style={{ padding: '16px 24px' }}>
                    {new Date(g.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                  </td>
                  
                  {/* Description */}
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    {g.descripcion}
                  </td>
                  
                  {/* Category */}
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${getBadgeClass(g.categoria)}`} style={{ fontSize: '0.75rem' }}>
                      {g.categoria}
                    </span>
                  </td>

                  {/* Cash Box Impact */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {g.cajaAfectada ? (
                      <span style={{ color: 'var(--primary-green)', fontWeight: 600, fontSize: '0.85rem' }}>Efectivo Caja</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Banco / Otro</span>
                    )}
                  </td>
                  
                  {/* Amount */}
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--danger-rust)' }}>
                    {formatCurrency(g.monto)}
                  </td>
                  
                  {/* Actions */}
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteGasto(g.id)}
                      className="btn btn-danger btn-icon-only"
                      style={{ backgroundColor: 'transparent', borderColor: 'var(--danger-rust)', color: 'var(--danger-rust)' }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Registrar Nuevo Gasto</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Descripción / Concepto *
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    className="input"
                    placeholder="Ej. Compra de granos de café, Pago luz"
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                  {formErrors.descripcion && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {formErrors.descripcion}
                    </span>
                  )}
                </div>

                {/* Category & Amount */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Category */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Categoría
                    </label>
                    <select
                      name="categoria"
                      className="input"
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      {formCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Monto ($) *
                    </label>
                    <input
                      type="number"
                      name="monto"
                      className="input"
                      placeholder="0"
                      value={formData.monto}
                      onChange={handleChange}
                      min="0"
                      step="any"
                    />
                    {formErrors.monto && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                        {formErrors.monto}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    className="input"
                    value={formData.fecha}
                    onChange={handleChange}
                  />
                  {formErrors.fecha && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {formErrors.fecha}
                    </span>
                  )}
                </div>

                {/* Cash Drawer Impact */}
                <div style={{
                  padding: '16px',
                  backgroundColor: cajaActiva ? 'rgba(30, 63, 32, 0.02)' : 'rgba(168, 74, 50, 0.02)',
                  border: `1px solid ${cajaActiva ? 'var(--border-color)' : 'rgba(168, 74, 50, 0.15)'}`,
                  borderRadius: 'var(--radius-md)',
                  marginTop: '4px'
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: cajaActiva ? 'pointer' : 'not-allowed', 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    color: cajaActiva ? 'var(--text-dark)' : 'var(--text-muted)'
                  }}>
                    <input
                      type="checkbox"
                      name="cajaAfectada"
                      checked={cajaActiva ? formData.cajaAfectada : false}
                      onChange={handleChange}
                      disabled={!cajaActiva}
                      style={{ accentColor: 'var(--primary-green)' }}
                    />
                    Pagar con efectivo de caja activa
                  </label>
                  
                  {!cajaActiva ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--danger-rust)' }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>Caja cerrada. Habilitá la caja para pagar gastos con efectivo físico.</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Si se tilda, el gasto se registrará como una "Salida de Efectivo" en el arqueo del turno actual.
                    </div>
                  )}
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Gasto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gastos;
