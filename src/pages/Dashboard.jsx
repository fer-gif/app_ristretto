import React, { useState, useMemo } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  DollarSign, 
  ShoppingBag, 
  ArrowDownRight, 
  Inbox,
  Coffee,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  Calendar,
  X,
  ArrowUpRight,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { 
    ventas, 
    gastos, 
    cajaActiva, 
    setActiveTab,
    deleteGasto 
  } = useRistretto();

  // Dashboard Sub-Tabs: 'resumen' | 'ventas' | 'gastos'
  const [activeSubTab, setActiveSubTab] = useState('resumen');

  // Filter States
  const [rangeType, setRangeType] = useState('hoy');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Search States
  const [ventasSearch, setVentasSearch] = useState('');
  const [gastosSearch, setGastosSearch] = useState('');

  // Selected details modal
  const [selectedSale, setSelectedSale] = useState(null);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Helper to format dates
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' hs';
    } catch (e) {
      return dateStr;
    }
  };

  // Range Filtering Logic
  const filteredData = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (rangeType === 'hoy') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'ayer') {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === '7dias') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === '30dias') {
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'esteMes') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'custom') {
      start = new Date(startDate + 'T00:00:00');
      end = new Date(endDate + 'T23:59:59');
    }

    const checkRange = (itemDateStr) => {
      if (!itemDateStr) return false;
      if (rangeType === 'historico') return true;
      const itemDate = new Date(itemDateStr);
      return itemDate >= start && itemDate <= end;
    };

    const s = Array.isArray(ventas) ? ventas.filter(v => v && checkRange(v.fecha)) : [];
    const g = Array.isArray(gastos) ? gastos.filter(exp => exp && checkRange(exp.fecha)) : [];

    return { sales: s, expenses: g };
  }, [ventas, gastos, rangeType, startDate, endDate]);

  // Compute Metrics based on filtered data
  const metrics = useMemo(() => {
    const sales = filteredData.sales;
    const expenses = filteredData.expenses;

    const totalSales = sales.reduce((acc, v) => acc + (v.total || 0), 0);
    const totalCost = sales.reduce((acc, v) => acc + (v.costo || 0), 0);
    const salesProfit = totalSales - totalCost; // Gross profit from sales
    const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.monto || 0), 0);
    const netProfit = salesProfit - totalExpenses; // Net final profit
    const averageTicket = sales.length > 0 ? (totalSales / sales.length) : 0;

    // Categories breakdown
    const categorySales = {};
    sales.forEach(v => {
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

    // Payment methods breakdown
    const paymentMethods = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
    sales.forEach(v => {
      if (v && v.metodoPago) {
        paymentMethods[v.metodoPago] = (paymentMethods[v.metodoPago] || 0) + (v.total || 0);
      }
    });

    // Top products ranking in range (units sold)
    const productQuantities = {};
    sales.forEach(v => {
      if (v && Array.isArray(v.items)) {
        v.items.forEach(item => {
          if (item && item.name) {
            productQuantities[item.name] = (productQuantities[item.name] || 0) + (item.quantity || 0);
          }
        });
      }
    });
    const topProducts = Object.entries(productQuantities)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalSales,
      totalCost,
      salesProfit,
      totalExpenses,
      netProfit,
      averageTicket,
      categorySales,
      totalCategorySales,
      paymentMethods,
      topProducts,
      salesCount: sales.length,
      expensesCount: expenses.length
    };
  }, [filteredData]);

  // Compute Active Caja cash (depends only on current session state)
  const activeCajaCash = useMemo(() => {
    if (!cajaActiva) return 0;
    const totalIngresos = Array.isArray(cajaActiva.ingresosManuales) ? cajaActiva.ingresosManuales.reduce((acc, c) => acc + (c.monto || 0), 0) : 0;
    const totalEgresos = Array.isArray(cajaActiva.egresosManuales) ? cajaActiva.egresosManuales.reduce((acc, c) => acc + (c.monto || 0), 0) : 0;
    return (cajaActiva.montoInicial || 0) + (cajaActiva.ventasEfectivo || 0) + totalIngresos - totalEgresos;
  }, [cajaActiva]);

  // Filtered lists for rendering under detailed tabs
  const searchedSales = useMemo(() => {
    if (!ventasSearch.trim()) return filteredData.sales;
    const query = ventasSearch.toLowerCase();
    return filteredData.sales.filter(s => {
      const matchId = s.id?.toLowerCase().includes(query);
      const matchMesa = s.items?.[0]?.customNote?.toLowerCase().includes(query) || false; // Just in case
      const matchItems = s.items?.some(i => i.name.toLowerCase().includes(query)) || false;
      const matchMethod = s.metodoPago?.toLowerCase().includes(query) || false;
      return matchId || matchMesa || matchItems || matchMethod;
    });
  }, [filteredData.sales, ventasSearch]);

  const searchedExpenses = useMemo(() => {
    if (!gastosSearch.trim()) return filteredData.expenses;
    const query = gastosSearch.toLowerCase();
    return filteredData.expenses.filter(e => {
      const matchDesc = e.descripcion?.toLowerCase().includes(query);
      const matchCat = e.categoria?.toLowerCase().includes(query);
      return matchDesc || matchCat;
    });
  }, [filteredData.expenses, gastosSearch]);

  return (
    <div className="animate-fade-in" style={{ padding: '32px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Date Range Selectors */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '20px'
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
            Dashboard Financiero
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', marginTop: '4px' }}>
            Consola administrativa para control de utilidades, gastos y facturación.
          </p>
        </div>

        {/* Date Filters Control */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--card-bg)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>Filtro de Fecha:</span>
          </div>

          <select
            value={rangeType}
            onChange={(e) => setRangeType(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="7dias">Últimos 7 días</option>
            <option value="30dias">Últimos 30 días</option>
            <option value="esteMes">Este Mes</option>
            <option value="historico">Histórico Completo</option>
            <option value="custom">Rango Personalizado</option>
          </select>

          {rangeType === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>hasta</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Dashboard Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* KPI: Facturación (Ventas) */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Facturación Bruta</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(30, 63, 32, 0.06)',
              color: 'var(--primary-green)'
            }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatCurrency(metrics.totalSales)}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <span>{metrics.salesCount} ventas</span>
              <span style={{ fontWeight: 600 }}>T. Prom: {formatCurrency(metrics.averageTicket)}</span>
            </div>
          </div>
        </div>

        {/* KPI: Costo de Mercadería */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Costo Mercadería</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(212, 163, 115, 0.12)',
              color: 'var(--accent-gold)'
            }}>
              <Coffee size={16} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatCurrency(metrics.totalCost)}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <span>Insumos / Compra: {metrics.totalSales > 0 ? Math.round((metrics.totalCost / metrics.totalSales) * 100) : 0}% facturado</span>
            </div>
          </div>
        </div>

        {/* KPI: Margen Bruto (Ventas - Costos) */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Utilidad Ventas</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(30, 63, 32, 0.06)',
              color: 'var(--primary-green)'
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-green)' }}>
              {formatCurrency(metrics.salesProfit)}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                Margen Bruto: {metrics.totalSales > 0 ? Math.round((metrics.salesProfit / metrics.totalSales) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI: Gastos del Período */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Egresos / Gastos</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(168, 74, 50, 0.06)',
              color: 'var(--danger-rust)'
            }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger-rust)' }}>
              {formatCurrency(metrics.totalExpenses)}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              <span>{metrics.expensesCount} egresos</span>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveTab('gastos')}>Registrar</span>
            </div>
          </div>
        </div>

        {/* KPI: Utilidad Neta (Finanzas) */}
        <div className={`card card-hover`} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          padding: '16px 20px',
          borderLeft: `4px solid ${metrics.netProfit >= 0 ? 'var(--primary-green)' : 'var(--danger-rust)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Resultado Neto</span>
            <div style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: metrics.netProfit >= 0 ? 'rgba(30, 63, 32, 0.06)' : 'rgba(168, 74, 50, 0.06)',
              color: metrics.netProfit >= 0 ? 'var(--primary-green)' : 'var(--danger-rust)'
            }}>
              {metrics.netProfit >= 0 ? <ArrowUpRight size={16} /> : <TrendingDown size={16} />}
            </div>
          </div>
          <div>
            <h3 style={{ 
              fontFamily: 'var(--font-title)', 
              fontSize: '1.5rem', 
              fontWeight: 800,
              color: metrics.netProfit >= 0 ? 'var(--primary-green)' : 'var(--danger-rust)'
            }}>
              {formatCurrency(metrics.netProfit)}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span className={`badge ${metrics.netProfit >= 0 ? 'badge-green' : 'badge-rust'}`} style={{ fontSize: '0.7rem' }}>
                {metrics.netProfit >= 0 ? 'Superávit Financiero' : 'Déficit Financiero'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '24px',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveSubTab('resumen')}
          style={{
            padding: '10px 4px',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: activeSubTab === 'resumen' ? 'var(--primary-green)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: activeSubTab === 'resumen' ? '3px solid var(--primary-green)' : '3px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Resumen de Rendimiento
        </button>
        <button
          onClick={() => setActiveSubTab('ventas')}
          style={{
            padding: '10px 4px',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: activeSubTab === 'ventas' ? 'var(--primary-green)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: activeSubTab === 'ventas' ? '3px solid var(--primary-green)' : '3px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Auditoría de Ventas
        </button>
        <button
          onClick={() => setActiveSubTab('gastos')}
          style={{
            padding: '10px 4px',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: activeSubTab === 'gastos' ? 'var(--primary-green)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: activeSubTab === 'gastos' ? '3px solid var(--primary-green)' : '3px solid transparent',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Control de Gastos
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {activeSubTab === 'resumen' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {/* Left Column: Category Sales bar chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--primary-green)', fontWeight: 700 }}>
              Ventas por Categoría de Productos
            </h3>

            {metrics.salesCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Inbox size={36} style={{ opacity: 0.4 }} />
                <span>No hay ventas en este período para categorizar.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(metrics.categorySales).map(([cat, val]) => {
                  const percentage = metrics.totalCategorySales > 0 ? (val / metrics.totalCategorySales) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-main)' }}>{cat}</span>
                        <span style={{ color: 'var(--primary-green)' }}>{formatCurrency(val)} ({Math.round(percentage)}%)</span>
                      </div>
                      <div style={{
                        height: '10px',
                        backgroundColor: 'rgba(30, 63, 32, 0.05)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary-green)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Payment Methods and Best Sellers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Payment Methods */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                Métodos de Pago Utilizados
              </h3>

              {metrics.salesCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  Sin datos de pago.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  {Object.entries(metrics.paymentMethods).map(([method, val]) => {
                    const percentage = metrics.totalSales > 0 ? (val / metrics.totalSales) * 100 : 0;
                    return (
                      <div key={method} style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: 'rgba(30, 63, 32, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {method}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 2px', color: 'var(--primary-green)' }}>
                          {formatCurrency(val)}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                Productos Más Vendidos
              </h3>

              {metrics.topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Coffee size={28} style={{ opacity: 0.4 }} />
                  <span>Sin ventas registradas.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {metrics.topProducts.map((p, idx) => {
                    const maxQty = metrics.topProducts[0]?.qty || 1;
                    const percentage = (p.qty / maxQty) * 100;
                    return (
                      <div key={p.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>
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
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Detailed Sales Audit */}
      {activeSubTab === 'ventas' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary-green)', fontWeight: 700 }}>
              Historial de Ventas ({searchedSales.length})
            </h3>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por ID, producto, medio de pago..."
                value={ventasSearch}
                onChange={(e) => setVentasSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
              {ventasSearch && (
                <button
                  onClick={() => setVentasSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>ID Ticket</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Fecha / Hora</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Consumición</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Medio Pago</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Costo</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Total Cobrado</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Margen Neto</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700, textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.88rem' }}>
                {searchedSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Inbox size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                      No se encontraron ventas para esta búsqueda o rango.
                    </td>
                  </tr>
                ) : (
                  searchedSales.map((sale) => {
                    const profit = (sale.total || 0) - (sale.costo || 0);
                    const profitPercentage = sale.total > 0 ? Math.round((profit / sale.total) * 100) : 0;
                    return (
                      <tr key={sale.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {sale.id?.slice(2, 10)}...
                        </td>
                        <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                          {formatDateString(sale.fecha)}
                        </td>
                        <td style={{ padding: '12px 8px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sale.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${sale.metodoPago === 'Efectivo' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.72rem' }}>
                            {sale.metodoPago}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                          {formatCurrency(sale.costo || 0)}
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary-green)' }}>
                          {formatCurrency(sale.total)}
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: profit >= 0 ? 'var(--primary-green)' : 'var(--danger-rust)' }}>
                          {formatCurrency(profit)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>({profitPercentage}%)</span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="btn btn-secondary btn-icon-only"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FileText size={12} />
                            Ticket
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Detailed Expenses Control */}
      {activeSubTab === 'gastos' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: 'var(--primary-green)', fontWeight: 700 }}>
              Detalle de Gastos y Egresos ({searchedExpenses.length})
            </h3>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por descripción o categoría..."
                value={gastosSearch}
                onChange={(e) => setGastosSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
              {gastosSearch && (
                <button
                  onClick={() => setGastosSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Fecha / Hora</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Categoría</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Descripción</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Monto del Gasto</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700 }}>Afecta Caja Diaria</th>
                  <th style={{ padding: '12px 8px', fontWeight: 700, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.88rem' }}>
                {searchedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Inbox size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                      No se encontraron egresos registrados en este período.
                    </td>
                  </tr>
                ) : (
                  searchedExpenses.map((exp) => (
                    <tr key={exp.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        {formatDateString(exp.fecha)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="badge badge-rust" style={{ fontSize: '0.72rem' }}>
                          {exp.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                        {exp.descripcion}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--danger-rust)' }}>
                        {formatCurrency(exp.monto)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: exp.cajaAfectada ? 'var(--primary-green)' : 'var(--text-muted)' }}>
                          {exp.cajaAfectada ? 'Sí (Caja Chica)' : 'No (Inversión Extra)'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button
                          onClick={async () => {
                            if (window.confirm(`¿Seguro que deseás eliminar el gasto de ${formatCurrency(exp.monto)} ("${exp.descripcion}")?`)) {
                              await deleteGasto(exp.id);
                            }
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            color: 'var(--danger-rust)',
                            borderColor: 'var(--danger-rust)',
                            backgroundColor: 'transparent'
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Sale Ticket Inspector Modal */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px', padding: '24px' }}>
            <div className="modal-header" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, color: 'var(--primary-green)' }}>RISTRETTO COFFEE</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Chapadmalal, Buenos Aires</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedSale(null)}>×</button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
              {/* Ticket Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div><strong>TICKET ID:</strong> {selectedSale.id}</div>
                <div><strong>FECHA:</strong> {formatDateString(selectedSale.fecha)}</div>
                <div><strong>PAGO:</strong> {selectedSale.metodoPago}</div>
              </div>

              {/* Items List */}
              <div style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px' }}>
                  <span>DETALLE</span>
                  <span>SUBTOTAL</span>
                </div>
                {selectedSale.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.sellPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '12px' }}>
                {selectedSale.descuentoPorcentaje > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-rust)' }}>
                    <span>DESCUENTO ({selectedSale.descuentoPorcentaje}%):</span>
                    <span>-{formatCurrency(selectedSale.descuentoMonto || 0)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: 'var(--primary-green)' }}>
                  <span>TOTAL COBRADO:</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>

              {/* Business Margin Audit details (only for admins, in print layout it wouldn't print but shown on screen) */}
              <div style={{
                backgroundColor: 'rgba(30, 63, 32, 0.05)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                border: '1px solid var(--border-color)',
                marginTop: '16px'
              }}>
                <strong style={{ color: 'var(--primary-green)', display: 'block', marginBottom: '4px' }}>DATOS DE CONTROL COMERCIAL:</strong>
                <div>Costo de compra (CMV): {formatCurrency(selectedSale.costo || 0)}</div>
                <div>Ganancia comercial: {formatCurrency(selectedSale.total - (selectedSale.costo || 0))} ({selectedSale.total > 0 ? Math.round(((selectedSale.total - (selectedSale.costo || 0)) / selectedSale.total) * 100) : 0}%)</div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedSale(null)}
                style={{ flex: 1 }}
              >
                Cerrar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ flex: 1 }}
              >
                Reimprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
