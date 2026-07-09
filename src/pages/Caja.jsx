import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  Wallet, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  History,
  Info,
  Printer
} from 'lucide-react';

const Caja = () => {
  const {
    cajaActiva,
    abrirCaja,
    registrarMovimientoCaja,
    cerrarCaja,
    arqueos
  } = useRistretto();

  // Open Drawer Form State
  const [montoInicialInput, setMontoInicialInput] = useState('');
  const [openError, setOpenError] = useState('');

  // Cash Movement Modal State
  const [showMovModal, setShowMovModal] = useState(false);
  const [movTipo, setMovTipo] = useState('ingreso'); // 'ingreso' or 'egreso'
  const [movMonto, setMovMonto] = useState('');
  const [movDescripcion, setMovDescripcion] = useState('');
  const [movErrors, setMovErrors] = useState({});

  // Close Drawer Modal State
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [efectivoRealInput, setEfectivoRealInput] = useState('');
  const [closeErrors, setCloseErrors] = useState({});
  const [selectedArqueoDetails, setSelectedArqueoDetails] = useState(null);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Open Box Handler
  const handleAbrirCaja = (e) => {
    e.preventDefault();
    if (!montoInicialInput || parseFloat(montoInicialInput) < 0) {
      setOpenError('El monto inicial no puede ser menor a 0');
      return;
    }
    abrirCaja(parseFloat(montoInicialInput));
    setMontoInicialInput('');
    setOpenError('');
  };

  // Register Movement Handler
  const handleOpenMov = (tipo) => {
    setMovTipo(tipo);
    setMovMonto('');
    setMovDescripcion('');
    setMovErrors({});
    setShowMovModal(true);
  };

  const handleSaveMov = (e) => {
    e.preventDefault();
    const errors = {};
    if (!movMonto || parseFloat(movMonto) <= 0) errors.monto = 'El monto debe ser mayor a 0';
    if (!movDescripcion.trim()) errors.descripcion = 'La descripción es obligatoria';

    if (Object.keys(errors).length > 0) {
      setMovErrors(errors);
      return;
    }

    registrarMovimientoCaja(movTipo, parseFloat(movMonto), movDescripcion.trim());
    setShowMovModal(false);
  };

  // Close Drawer Handler
  const handleOpenCloseBox = () => {
    setEfectivoRealInput('');
    setCloseErrors({});
    setShowCloseModal(true);
  };

  const handleConfirmClose = (e) => {
    e.preventDefault();
    if (!efectivoRealInput || parseFloat(efectivoRealInput) < 0) {
      setCloseErrors({ efectivo: 'Ingrese un monto de efectivo válido igual o mayor a 0' });
      return;
    }

    cerrarCaja(parseFloat(efectivoRealInput));
    setShowCloseModal(false);
  };

  // Compute stats if box is open
  let totalIngresosManuales = 0;
  let totalEgresosManuales = 0;
  let efectivoEsperado = 0;

  if (cajaActiva) {
    totalIngresosManuales = cajaActiva.ingresosManuales.reduce((acc, curr) => acc + curr.monto, 0);
    totalEgresosManuales = cajaActiva.egresosManuales.reduce((acc, curr) => acc + curr.monto, 0);
    efectivoEsperado = cajaActiva.montoInicial + cajaActiva.ventasEfectivo + totalIngresosManuales - totalEgresosManuales;
  }

  // Generate audit badge classes
  const getResultBadgeClass = (res) => {
    switch (res) {
      case 'Balanceado': return 'badge-green';
      case 'Sobrante': return 'badge-gold';
      default: return 'badge-rust';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: 'var(--font-title)',
          fontWeight: 800,
          fontSize: '1.8rem',
          color: 'var(--primary-green)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Caja y Arqueo de Turno
        </h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          Controlá la apertura del turno, salidas/entradas de efectivo y realizá el arqueo diario
        </p>
      </div>

      {/* Main Box Area */}
      <div style={{ marginBottom: '40px' }}>
        {!cajaActiva ? (
          /* CAJA CERRADA PANEL */
          <div className="card" style={{
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            padding: '40px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(168, 74, 50, 0.06)',
              color: 'var(--danger-rust)'
            }}>
              <Wallet size={40} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                La Caja está Cerrada
              </h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.95rem' }}>
                Para poder registrar cobros en efectivo y movimientos físicos, debés abrir un nuevo turno indicando el fondo de caja (cambio).
              </p>
            </div>
            
            <form onSubmit={handleAbrirCaja} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Efectivo Inicial de Apertura ($)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="Ej. 10000"
                  value={montoInicialInput}
                  onChange={(e) => setMontoInicialInput(e.target.value)}
                  min="0"
                />
                {openError && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                    {openError}
                  </span>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Abrir Caja de Turno
              </button>
            </form>
          </div>
        ) : (
          /* CAJA ABIERTA PANEL */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Box Status Header */}
            <div className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-card)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '8px' }}>Turno Activo</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Apertura: {new Date(cajaActiva.fechaApertura).toLocaleString('es-AR')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleOpenMov('ingreso')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Plus size={14} />
                  Ingreso Efectivo
                </button>
                <button onClick={() => handleOpenMov('egreso')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Minus size={14} />
                  Salida Efectivo
                </button>
                <button onClick={handleOpenCloseBox} className="btn btn-danger" style={{ fontSize: '0.85rem' }}>
                  <CheckCircle size={14} />
                  Cierre de Caja (Arqueo)
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {/* Monto Inicial */}
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>1. Inicial Apertura</span>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-dark)' }}>
                  {formatCurrency(cajaActiva.montoInicial)}
                </h4>
              </div>

              {/* Ventas Efectivo */}
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>2. Ventas Efectivo</span>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary-green)' }}>
                  +{formatCurrency(cajaActiva.ventasEfectivo)}
                </h4>
              </div>

              {/* Movimientos Manuales Netos */}
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>3. Entradas/Salidas</span>
                <h4 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  marginTop: '8px',
                  color: (totalIngresosManuales - totalEgresosManuales) >= 0 ? 'var(--text-dark)' : 'var(--danger-rust)'
                }}>
                  {formatCurrency(totalIngresosManuales - totalEgresosManuales)}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  +{formatCurrency(totalIngresosManuales)} | -{formatCurrency(totalEgresosManuales)}
                </div>
              </div>

              {/* Efectivo Esperado Físico */}
              <div className="card" style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--primary-green)', backgroundColor: 'rgba(30, 63, 32, 0.01)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 700 }}>EFECTIVO ESPERADO</span>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.65rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary-green)' }}>
                  {formatCurrency(efectivoEsperado)}
                </h4>
              </div>
            </div>

            {/* Other Payment Methods (Card/MP Info card) */}
            <div className="card" style={{
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(30, 63, 32, 0.01)',
              borderStyle: 'dashed'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Info size={16} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Ventas registradas por otros medios electrónicos (Tarjeta, Transferencias):</span>
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-green)', fontSize: '1.1rem' }}>
                {formatCurrency(cajaActiva.ventasOtros)}
              </strong>
            </div>

            {/* Recent Manual movements list */}
            <div className="card">
              <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-green)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Registro de Movimientos del Turno
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Check if there are movements */}
                {cajaActiva.ingresosManuales.length === 0 && cajaActiva.egresosManuales.length === 0 && cajaActiva.ventasEfectivo === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No se registraron movimientos en este turno.</p>
                ) : (
                  <>
                    {/* Render inputs */}
                    {cajaActiva.ingresosManuales.map(mov => (
                      <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(30, 63, 32, 0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px', marginRight: '8px' }}>Ingreso Manual</span>
                          <strong style={{ fontSize: '0.9rem' }}>{mov.descripcion}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {new Date(mov.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--primary-green)' }}>+{formatCurrency(mov.monto)}</span>
                      </div>
                    ))}

                    {/* Render exits */}
                    {cajaActiva.egresosManuales.map(mov => (
                      <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(168, 74, 50, 0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span className="badge badge-rust" style={{ fontSize: '0.7rem', padding: '2px 6px', marginRight: '8px' }}>Salida Manual</span>
                          <strong style={{ fontSize: '0.9rem' }}>{mov.descripcion}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {new Date(mov.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--danger-rust)' }}>-{formatCurrency(mov.monto)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Historical Audits (Arqueos Cerrados) */}
      <div className="card">
        <h3 style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--primary-green)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <History size={20} />
          Historial de Arqueos de Caja
        </h3>

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
              <th style={{ padding: '12px 16px' }}>Cierre</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Fondo Inicial</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Venta Efectivo</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Esperado</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Real Contado</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Diferencia</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {arqueos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{
                  textAlign: 'center',
                  padding: '30px 16px',
                  color: 'var(--text-muted)'
                }}>
                  No hay cierres de caja registrados en el historial.
                </td>
              </tr>
            ) : (
              arqueos.map(arq => (
                <tr 
                  key={arq.id} 
                  onClick={() => setSelectedArqueoDetails(arq)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }} 
                  className="table-row-hover"
                  title="Click para ver detalles del arqueo"
                >
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                    {new Date(arq.fechaCierre).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(arq.montoInicial)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(arq.ventasEfectivo)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(arq.efectivoEsperado)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatCurrency(arq.efectivoReal)}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: arq.diferencia === 0 ? 'var(--primary-green)' : arq.diferencia > 0 ? '#c48c58' : 'var(--danger-rust)'
                  }}>
                    {arq.diferencia > 0 ? `+${formatCurrency(arq.diferencia)}` : formatCurrency(arq.diferencia)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span className={`badge ${getResultBadgeClass(arq.resultado)}`} style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {arq.resultado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Movement Modal */}
      {showMovModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{movTipo === 'ingreso' ? 'Ingreso de Efectivo' : 'Salida de Efectivo'}</h3>
              <button className="modal-close-btn" onClick={() => setShowMovModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveMov}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Monto ($) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={movMonto}
                    onChange={(e) => setMovMonto(e.target.value)}
                    min="0"
                    step="any"
                  />
                  {movErrors.monto && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {movErrors.monto}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Descripción / Concepto *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder={movTipo === 'ingreso' ? 'Ej. Agrego cambio de caja' : 'Ej. Pago proveedor medialunas'}
                    value={movDescripcion}
                    onChange={(e) => setMovDescripcion(e.target.value)}
                  />
                  {movErrors.descripcion && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {movErrors.descripcion}
                    </span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMovModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Drawer / Arqueo Modal */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Arqueo y Cierre de Caja</h3>
              <button className="modal-close-btn" onClick={() => setShowCloseModal(false)}>×</button>
            </div>
            <form onSubmit={handleConfirmClose}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Expected Cash Info Panel */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 63, 32, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Efectivo Esperado en Sistema:</span>
                    <strong style={{ color: 'var(--primary-green)' }}>{formatCurrency(efectivoEsperado)}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    (Inicial: {formatCurrency(cajaActiva.montoInicial)} + Ventas Efectivo: {formatCurrency(cajaActiva.ventasEfectivo)} + Entradas: {formatCurrency(totalIngresosManuales)} - Salidas: {formatCurrency(totalEgresosManuales)})
                  </div>
                </div>

                {/* Actual Counted Cash Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    EFECTIVO REAL CONTADO EN CAJA ($) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Cuente el efectivo físico e ingrese el total..."
                    value={efectivoRealInput}
                    onChange={(e) => setEfectivoRealInput(e.target.value)}
                    min="0"
                    step="any"
                    style={{ fontSize: '1.1rem', fontWeight: 600, padding: '12px 14px' }}
                  />
                  {closeErrors.efectivo && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {closeErrors.efectivo}
                    </span>
                  )}
                </div>

                {/* Live Audit Difference Calculation */}
                {efectivoRealInput !== '' && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: (parseFloat(efectivoRealInput) - efectivoEsperado) === 0 ? 'rgba(30, 63, 32, 0.06)' : 'rgba(168, 74, 50, 0.06)',
                    border: `1px solid ${(parseFloat(efectivoRealInput) - efectivoEsperado) === 0 ? 'var(--primary-green)' : 'rgba(168, 74, 50, 0.15)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Diferencia de Arqueo:</span>
                    <strong style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      color: (parseFloat(efectivoRealInput) - efectivoEsperado) === 0 ? 'var(--primary-green)' : (parseFloat(efectivoRealInput) - efectivoEsperado) > 0 ? '#b07945' : 'var(--danger-rust)'
                    }}>
                      {(parseFloat(efectivoRealInput) - efectivoEsperado) > 0 ? '+' : ''}
                      {formatCurrency(parseFloat(efectivoRealInput) - efectivoEsperado)}
                    </strong>
                  </div>
                )}

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-danger">Confirmar Cierre de Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Audit Details Modal */}
      {selectedArqueoDetails && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Detalles del Arqueo</h3>
              <button className="modal-close-btn" onClick={() => setSelectedArqueoDetails(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={`badge ${getResultBadgeClass(selectedArqueoDetails.resultado)}`}>
                  {selectedArqueoDetails.resultado}
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Apertura: {new Date(selectedArqueoDetails.fechaApertura).toLocaleString('es-AR')}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Cierre: {new Date(selectedArqueoDetails.fechaCierre).toLocaleString('es-AR')}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Financial Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fondo Inicial:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedArqueoDetails.montoInicial)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventas en Efectivo:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-green)' }}>+{formatCurrency(selectedArqueoDetails.ventasEfectivo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ingresos Manuales:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>+{formatCurrency((selectedArqueoDetails.ingresosManuales || []).reduce((a,c) => a+c.monto, 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Salidas Manuales:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger-rust)' }}>-{formatCurrency((selectedArqueoDetails.egresosManuales || []).reduce((a,c) => a+c.monto, 0))}</span>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Efectivo Esperado:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(selectedArqueoDetails.efectivoEsperado)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Efectivo Real Contado:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-green)' }}>{formatCurrency(selectedArqueoDetails.efectivoReal)}</span>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  color: selectedArqueoDetails.diferencia === 0 ? 'var(--primary-green)' : selectedArqueoDetails.diferencia > 0 ? '#c48c58' : 'var(--danger-rust)'
                }}>
                  <span>Diferencia:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {selectedArqueoDetails.diferencia > 0 ? '+' : ''}
                    {formatCurrency(selectedArqueoDetails.diferencia)}
                  </span>
                </div>
              </div>

              {/* Transactions log from that day */}
              {(selectedArqueoDetails.ingresosManuales || []).length > 0 || (selectedArqueoDetails.egresosManuales || []).length > 0 ? (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>MOVIMIENTOS EXTRAORDINARIOS</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                    {(selectedArqueoDetails.ingresosManuales || []).map((m, idx) => (
                      <div key={`in-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 8px', backgroundColor: 'rgba(30,63,32,0.02)', borderRadius: '4px' }}>
                        <span>[Ingreso] {m.descripcion}</span>
                        <strong>+{formatCurrency(m.monto)}</strong>
                      </div>
                    ))}
                    {(selectedArqueoDetails.egresosManuales || []).map((m, idx) => (
                      <div key={`out-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 8px', backgroundColor: 'rgba(168,74,50,0.02)', borderRadius: '4px' }}>
                        <span>[Salida] {m.descripcion}</span>
                        <strong style={{ color: 'var(--danger-rust)' }}>-{formatCurrency(m.monto)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} />
                Imprimir Reporte
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedArqueoDetails(null)}>Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Hidden print-only layout for cash box audit report */}
      {selectedArqueoDetails && (
        <div className="print-only" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '80mm',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#000000',
          padding: '10px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px' }}>RISTRETTO COFFEE</h2>
            <p style={{ fontSize: '9px', margin: 0 }}>Chapadmalal</p>
            <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '4px 0 0' }}>REPORTE DE ARQUEO DE CAJA</p>
            <p style={{ fontSize: '10px', margin: '4px 0 0' }}>--------------------------------</p>
          </div>

          <div style={{ fontSize: '10px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div>Apertura: {new Date(selectedArqueoDetails.fechaApertura).toLocaleString('es-AR')}</div>
            <div>Cierre: {new Date(selectedArqueoDetails.fechaCierre).toLocaleString('es-AR')}</div>
            <div>Resultado: {selectedArqueoDetails.resultado.toUpperCase()}</div>
          </div>

          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '8px 0', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Fondo Inicial:</span>
              <span>{formatCurrency(selectedArqueoDetails.montoInicial)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ventas Efectivo:</span>
              <span>+{formatCurrency(selectedArqueoDetails.ventasEfectivo)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Ingresos Manuales:</span>
              <span>+{formatCurrency((selectedArqueoDetails.ingresosManuales || []).reduce((a,c) => a+c.monto, 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Salidas Manuales:</span>
              <span>-{formatCurrency((selectedArqueoDetails.egresosManuales || []).reduce((a,c) => a+c.monto, 0))}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px' }}>
              <span>Efectivo Esperado:</span>
              <span>{formatCurrency(selectedArqueoDetails.efectivoEsperado)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Real Contado:</span>
              <span>{formatCurrency(selectedArqueoDetails.efectivoReal)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              borderTop: '1px solid #000',
              paddingTop: '4px',
              color: selectedArqueoDetails.diferencia === 0 ? 'black' : 'red'
            }}>
              <span>Diferencia:</span>
              <span>
                {selectedArqueoDetails.diferencia > 0 ? '+' : ''}
                {formatCurrency(selectedArqueoDetails.diferencia)}
              </span>
            </div>
          </div>

          {(selectedArqueoDetails.ingresosManuales || []).length > 0 || (selectedArqueoDetails.egresosManuales || []).length > 0 ? (
            <div style={{ fontSize: '10px', marginTop: '10px' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>DETALLE DE MOVIMIENTOS:</p>
              {(selectedArqueoDetails.ingresosManuales || []).map((m, idx) => (
                <div key={`pin-${idx}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>[+] {m.descripcion.slice(0, 18)}</span>
                  <span>{formatCurrency(m.monto)}</span>
                </div>
              ))}
              {(selectedArqueoDetails.egresosManuales || []).map((m, idx) => (
                <div key={`pout-${idx}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>[-] {m.descripcion.slice(0, 18)}</span>
                  <span>{formatCurrency(m.monto)}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '9px' }}>
            <p>Auditoría Ristretto Coffee</p>
            <p>Chapadmalal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;
