import React from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  DollarSign, 
  ShoppingBag, 
  ArrowDownRight, 
  Inbox,
  Coffee,
  PlusCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';

const Dashboard = () => {
  const { 
    ventas, 
    gastos, 
    cajaActiva, 
    setActiveTab 
  } = useRistretto();

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter today's transactions
  const todayStr = new Date().toISOString().slice(0, 10);
  const salesToday = Array.isArray(ventas) ? ventas.filter(v => v && typeof v.fecha === 'string' && v.fecha.startsWith(todayStr)) : [];
  const expensesToday = Array.isArray(gastos) ? gastos.filter(g => g && typeof g.fecha === 'string' && g.fecha.startsWith(todayStr)) : [];

  // Compute metrics
  const totalSalesToday = salesToday.reduce((acc, v) => acc + (v.total || 0), 0);
  const totalCostToday = salesToday.reduce((acc, v) => acc + (v.costo || 0), 0);
  const netProfitToday = totalSalesToday - totalCostToday;
  const totalExpensesToday = expensesToday.reduce((acc, g) => acc + (g.monto || 0), 0);

  // Compute Active Caja Cash
  let activeCajaCash = 0;
  if (cajaActiva) {
    const totalIngresosManuales = Array.isArray(cajaActiva.ingresosManuales) ? cajaActiva.ingresosManuales.reduce((acc, c) => acc + (c.monto || 0), 0) : 0;
    const totalEgresosManuales = Array.isArray(cajaActiva.egresosManuales) ? cajaActiva.egresosManuales.reduce((acc, c) => acc + (c.monto || 0), 0) : 0;
    activeCajaCash = (cajaActiva.montoInicial || 0) + (cajaActiva.ventasEfectivo || 0) + totalIngresosManuales - totalEgresosManuales;
  }

  // Categories Breakdown for visual bar charts
  const categorySales = {};
  salesToday.forEach(v => {
    if (v && Array.isArray(v.items)) {
      v.items.forEach(item => {
        if (item) {
          const cat = item.category || 'Varios';
          categorySales[cat] = (categorySales[cat] || 0) + (item.subtotal || 0);
        }
      });
    }
  });

  const totalCategorySales = Object.values(categorySales).reduce((acc, val) => acc + val, 0);

  // Payment Methods Breakdown
  const paymentMethods = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
  salesToday.forEach(v => {
    if (v && v.metodoPago) {
      paymentMethods[v.metodoPago] = (paymentMethods[v.metodoPago] || 0) + (v.total || 0);
    }
  });

  // Calculate top products ranking (historical total units sold)
  const productQuantities = {};
  if (Array.isArray(ventas)) {
    ventas.forEach(v => {
      if (v && Array.isArray(v.items)) {
        v.items.forEach(item => {
          if (item && item.name) {
            productQuantities[item.name] = (productQuantities[item.name] || 0) + (item.quantity || 0);
          }
        });
      }
    });
  }

  const topProducts = Object.entries(productQuantities)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

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
            Resumen Diario
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            Hola, acá tenés los datos de hoy ({new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })})
          </p>
        </div>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('pos')}
          >
            <Coffee size={16} />
            Tomar Pedido
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('gastos')}
          >
            <PlusCircle size={16} />
            Registrar Gasto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Ventas Totales */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Ventas del Día</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(30, 63, 32, 0.08)',
              color: 'var(--primary-green)'
            }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 800 }}>
              {formatCurrency(totalSalesToday)}
            </h3>
            <span className="badge badge-green" style={{ marginTop: '8px' }}>
              {salesToday.length} pedidos
            </span>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Ganancia Estimada</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(212, 163, 115, 0.15)',
              color: 'var(--accent-gold)'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 800 }}>
              {formatCurrency(netProfitToday)}
            </h3>
            <span className="badge badge-gold" style={{ marginTop: '8px' }}>
              Margen: {totalSalesToday > 0 ? Math.round((netProfitToday / totalSalesToday) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Gastos Registrados */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Gastos de Hoy</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(168, 74, 50, 0.08)',
              color: 'var(--danger-rust)'
            }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 800 }}>
              {formatCurrency(totalExpensesToday)}
            </h3>
            <span className="badge badge-rust" style={{ marginTop: '8px' }}>
              {expensesToday.length} registros
            </span>
          </div>
        </div>

        {/* Caja Actual */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Efectivo en Caja</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: cajaActiva ? 'rgba(30, 63, 32, 0.08)' : 'rgba(168, 74, 50, 0.08)',
              color: cajaActiva ? 'var(--primary-green)' : 'var(--danger-rust)'
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 800 }}>
              {cajaActiva ? formatCurrency(activeCajaCash) : 'Sin Abrir'}
            </h3>
            <span 
              onClick={() => setActiveTab('caja')}
              style={{
                marginTop: '8px', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              className={`badge ${cajaActiva ? 'badge-green' : 'badge-rust'}`}
            >
              {cajaActiva ? 'Ver Arqueo' : 'Abrir Turno'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Ventas Recientes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary-green)', fontWeight: 700 }}>
            Últimas Ventas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
            {salesToday.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Inbox size={32} style={{ opacity: 0.5 }} />
                <span>No se registraron ventas hoy todavía.</span>
              </div>
            ) : (
              salesToday.slice(0, 5).map((sale) => (
                <div key={sale.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(30, 63, 32, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(sale.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} • {sale.metodoPago}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-title)',
                    fontWeight: 700,
                    color: 'var(--primary-green)',
                    fontSize: '1rem'
                  }}>
                    {formatCurrency(sale.total)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary-green)', fontWeight: 700 }}>
            Distribución de Ventas
          </h3>
          
          {salesToday.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Inbox size={32} style={{ opacity: 0.5 }} />
              <span>Esperando datos de ventas del día.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Category Sales Chart */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                  Ventas por Categoría
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(categorySales).map(([cat, val]) => {
                    const percentage = totalCategorySales > 0 ? (val / totalCategorySales) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>
                          <span>{cat}</span>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(val)} ({Math.round(percentage)}%)</span>
                        </div>
                        <div style={{
                          height: '8px',
                          backgroundColor: 'rgba(30, 63, 32, 0.05)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: 'var(--primary-green)',
                            borderRadius: 'var(--radius-full)'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                  Métodos de Pago
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.entries(paymentMethods).map(([method, val]) => {
                    const percentage = totalSalesToday > 0 ? (val / totalSalesToday) * 100 : 0;
                    return (
                      <div key={method} style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: 'rgba(30, 63, 32, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {method}
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, margin: '6px 0 2px', color: 'var(--primary-green)' }}>
                          {formatCurrency(val)}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Productos Más Vendidos */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary-green)', fontWeight: 700 }}>
            Productos Más Vendidos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
            {topProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Coffee size={32} style={{ opacity: 0.5 }} />
                <span>Registrá ventas para generar estadísticas.</span>
              </div>
            ) : (
              topProducts.map((p, idx) => {
                const maxQty = topProducts[0]?.qty || 1;
                const percentage = (p.qty / maxQty) * 100;
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px', fontWeight: 500 }}>
                      <span style={{ fontWeight: 600 }}>
                        {idx + 1}. {p.name}
                      </span>
                      <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>{p.qty} un.</span>
                    </div>
                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(30, 63, 32, 0.04)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? 'var(--accent-gold)' : 'var(--primary-green)',
                        borderRadius: 'var(--radius-full)'
                      }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
