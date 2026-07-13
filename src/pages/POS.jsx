import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  Search, 
  Trash2, 
  Minus, 
  Plus, 
  MessageSquare, 
  Receipt,
  ShoppingCart,
  Slash,
  ChevronRight,
  AlertTriangle,
  Printer
} from 'lucide-react';

const POS = () => {
  const {
    menu,
    cart,
    setCart,
    cartDiscount,
    setCartDiscount,
    addToCart,
    updateCartQuantity,
    updateCartItemNote,
    removeFromCart,
    realizarVenta,
    cajaActiva,
    setActiveTab,
    
    pedidosActivos,
    guardarPedidoActivo,
    eliminarPedidoActivo,
    clearCart,
    
    categorias,
    userRole
  } = useRistretto();

  // POS Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // POS Tab Navigation
  const [posTab, setPosTab] = useState('productos'); // 'productos' o 'mesas'
  const [activeTableId, setActiveTableId] = useState(null);
  const [showSaveTableModal, setShowSaveTableModal] = useState(false);
  const [tableNameInput, setTableNameInput] = useState('');
  const [saveErrors, setSaveErrors] = useState('');
  const [activeTableForComanda, setActiveTableForComanda] = useState(null);
  const [showCartMobile, setShowCartMobile] = useState(false);

  // Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [lastSale, setLastSale] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter products dynamically based on context categories
  const categories = ['Todos', ...(Array.isArray(categorias) ? categorias : [])];
  const filteredProducts = menu.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);
  const discountAmount = subtotal * (cartDiscount / 100);
  const total = subtotal - discountAmount;

  // Handlers
  const handleOpenNoteModal = (item) => {
    setSelectedCartItem(item);
    setTempNote(item.customNote || '');
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedCartItem) {
      updateCartItemNote(selectedCartItem.product.id, selectedCartItem.customNote, tempNote);
      setShowNoteModal(false);
      setSelectedCartItem(null);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const handleConfirmSale = async () => {
    try {
      const sale = await realizarVenta(metodoPago, total);
      if (sale) {
        setLastSale(sale);
        setShowCheckoutModal(false);
        setShowTicketModal(true);
        setShowCartMobile(false);
        
        // Si cobramos una mesa activa, la eliminamos de la lista
        if (activeTableId) {
          eliminarPedidoActivo(activeTableId);
          setActiveTableId(null);
        }
      }
    } catch (err) {
      console.error("Error al realizar la venta:", err);
      alert("Hubo un error al registrar la venta. Por favor reintente.");
    }
  };

  const handleLoadTable = (table) => {
    setCart(table.items);
    setCartDiscount(table.discount || 0);
    setActiveTableId(table.id);
    setPosTab('productos'); // Cambiar a la cuadrícula de productos
    setShowCartMobile(true);
  };

  const handleCancelEditTable = () => {
    clearCart();
    setActiveTableId(null);
    setShowCartMobile(false);
  };

  const handleOpenSaveTable = () => {
    if (cart.length === 0) return;
    if (activeTableId) {
      // Si ya es una mesa existente, actualizamos directamente sin pedir nombre
      guardarPedidoActivo(activeTableId, cart, cartDiscount);
      clearCart();
      setActiveTableId(null);
      setShowCartMobile(false);
    } else {
      setTableNameInput('');
      setSaveErrors('');
      setShowSaveTableModal(true);
    }
  };

  const handleConfirmSaveTable = (e) => {
    e.preventDefault();
    if (!tableNameInput.trim()) {
      setSaveErrors('Debe ingresar un nombre o número de mesa');
      return;
    }
    
    // Guardar mesa
    guardarPedidoActivo(tableNameInput.trim(), cart, cartDiscount);
    
    // Limpiar carrito
    clearCart();
    setActiveTableId(null);
    setShowSaveTableModal(false);
    setShowCartMobile(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintComanda = (table) => {
    setActiveTableForComanda(table);
    setTimeout(() => {
      window.print();
      setActiveTableForComanda(null);
    }, 100);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flex: 1, height: '100vh', overflow: 'hidden' }}>
      <div className="no-print pos-layout" style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
         {/* Products Selection Panel */}
      <div className="pos-products-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
        
        {/* Navigation Tabs (Products vs. Active Tables) */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setPosTab('productos')}
            style={{
              padding: '8px 16px',
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              fontSize: '1rem',
              color: posTab === 'productos' ? 'var(--primary-green)' : 'var(--text-muted)',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: posTab === 'productos' ? '3px solid var(--primary-green)' : '3px solid transparent',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Productos
          </button>
          
          <button
            onClick={() => setPosTab('mesas')}
            style={{
              padding: '8px 16px',
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              fontSize: '1rem',
              color: posTab === 'mesas' ? 'var(--primary-green)' : 'var(--text-muted)',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: posTab === 'mesas' ? '3px solid var(--primary-green)' : '3px solid transparent',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Pedidos Abiertos
            {pedidosActivos.length > 0 && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--primary-green)',
                color: 'var(--text-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {pedidosActivos.length}
              </span>
            )}
          </button>
        </div>

        {posTab === 'mesas' ? (
          /* ACTIVE TABLES GRID */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {/* Quick stats banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              backgroundColor: 'rgba(30, 63, 32, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Tenés {pedidosActivos.length} pedidos activos sin cobrar. Podés cargar cualquiera en el carrito para seguir agregando consumiciones o facturarlo.
              </span>
            </div>

            {/* Tables Grid */}
            {pedidosActivos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                margin: 'auto'
              }}>
                <ShoppingCart size={40} style={{ opacity: 0.3 }} />
                <span style={{ fontWeight: 600 }}>No hay mesas ni pedidos abiertos.</span>
                <span style={{ fontSize: '0.85rem' }}>Agregá productos al carrito y hacé clic en "Guardar en Mesa" para iniciar uno.</span>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px'
              }}>
                {pedidosActivos.map(table => {
                  const tableTotal = table.items.reduce((a, c) => a + (c.product.sellPrice * c.quantity), 0);
                  const discountedTotal = tableTotal - (tableTotal * (table.discount || 0) / 100);
                  
                  return (
                    <div 
                      key={table.id}
                      className="card card-hover"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '20px',
                        gap: '12px'
                      }}
                    >
                      <div>
                        {/* Table Name */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{
                            fontFamily: 'var(--font-title)',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            color: 'var(--primary-green)'
                          }}>
                            {table.id}
                          </h4>
                          {table.discount > 0 && (
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                              -{table.discount}% Desc
                            </span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Apertura: {new Date(table.fechaApertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Items Preview */}
                        <div style={{
                          margin: '12px 0 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          fontSize: '0.85rem',
                          maxHeight: '80px',
                          overflowY: 'auto'
                        }}>
                          {table.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                {item.quantity}x {item.product.name}
                              </span>
                              <span style={{ fontWeight: 500 }}>
                                {formatCurrency(item.product.sellPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total & Action Buttons */}
                      <div style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '12px',
                        margin: 'auto 0 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL:</span>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--primary-green)', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
                            {formatCurrency(discountedTotal)}
                          </strong>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleLoadTable(table)}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px 8px', fontSize: '0.82rem' }}
                          >
                            {userRole === 'admin' ? 'Editar / Cobrar' : 'Editar Pedido'}
                          </button>
                          <button
                            onClick={() => handlePrintComanda(table)}
                            className="btn btn-secondary btn-icon-only"
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              borderColor: 'var(--primary-green)',
                              color: 'var(--primary-green)'
                            }}
                            title="Imprimir Comanda de Cocina"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => eliminarPedidoActivo(table.id)}
                            className="btn btn-danger btn-icon-only"
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              borderColor: 'var(--danger-rust)',
                              color: 'var(--danger-rust)'
                            }}
                            title="Eliminar Mesa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD PRODUCTS LIST */
          <>
            {/* Search & Filter Header */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Search bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Buscar café, medialuna, tostado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>

              {/* Category filter pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: selectedCategory === cat ? 'var(--primary-green)' : 'var(--bg-card)',
                      color: selectedCategory === cat ? 'var(--text-light)' : 'var(--text-dark)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="products-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
              flex: 1
            }}>
              {filteredProducts.map(product => {
                const isOutOfStock = product.trackStock && product.stock <= 0;
                return (
                  <div 
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`card card-hover ${isOutOfStock ? 'out-of-stock' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '16px',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.6 : 1,
                      backgroundColor: 'var(--bg-card)',
                      position: 'relative'
                    }}
                  >
                    {/* Category tag */}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {product.category}
                    </span>

                    {/* Name */}
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--primary-green)',
                      margin: '8px 0 12px',
                      lineHeight: '1.2'
                    }}>
                      {product.name}
                    </h3>

                    {/* Bottom row (price & stock status) */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-title)',
                        fontSize: '1.1rem',
                        fontWeight: 800
                      }}>
                        {formatCurrency(product.sellPrice)}
                      </span>
                      
                      {product.trackStock && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: product.stock <= 5 ? 'var(--danger-rust)' : 'var(--text-muted)'
                        }}>
                          {isOutOfStock ? 'Agotado' : `${product.stock} un.`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Cart Panel (Right side) */}
      <div className={`pos-cart-panel ${showCartMobile ? 'open' : ''}`} style={{
        width: '380px',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Mobile Cart Header */}
        <div className="mobile-cart-header" style={{
          display: 'none',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-green)' }}>
            Detalle del Pedido
          </h3>
          <button 
            onClick={() => setShowCartMobile(false)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Cerrar
          </button>
        </div>

        {/* Cart Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShoppingCart size={20} />
            Pedido Actual
          </h3>
          {cart.length > 0 && (
            <span className="badge badge-green">
              {cart.reduce((acc, i) => acc + i.quantity, 0)} ítems
            </span>
          )}
        </div>

        {activeTableId && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(212, 163, 115, 0.12)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#b07945'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              Editando: {activeTableId}
            </span>
            <button 
              onClick={handleCancelEditTable}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--danger-rust)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                textDecoration: 'underline'
              }}
            >
              Salir
            </button>
          </div>
        )}

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              margin: 'auto'
            }}>
              <ShoppingCart size={40} style={{ opacity: 0.3 }} />
              <span style={{ fontWeight: 500 }}>El carrito está vacío.</span>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Hace clic en los productos para agregarlos.</span>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.product.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.product.sellPrice)} c/u
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {formatCurrency(item.product.sellPrice * item.quantity)}
                  </span>
                </div>

                {/* Custom Note Indicator */}
                {item.customNote && (
                  <div style={{
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(212, 163, 115, 0.08)',
                    color: '#b07945',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MessageSquare size={12} />
                    Nota: "{item.customNote}"
                  </div>
                )}

                {/* Item Actions (Controls + Note button + Delete) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenNoteModal(item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      title="Agregar Nota"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.customNote)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger-rust)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(30, 63, 32, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px'
                  }}>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.customNote)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        color: 'var(--primary-green)'
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{
                      padding: '0 10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.customNote)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        color: 'var(--primary-green)'
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals Summary */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(30, 63, 32, 0.01)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* Quick Discount Picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Descuento</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={cartDiscount}
                onChange={(e) => setCartDiscount(parseInt(e.target.value))}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <option value={0}>0%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
              </select>
              {discountAmount > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--danger-rust)', fontWeight: 600 }}>
                  -{formatCurrency(discountAmount)}
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

          {/* Final Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-green)' }}>TOTAL</span>
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              fontSize: '1.45rem',
              color: 'var(--primary-green)'
            }}>
              {formatCurrency(total)}
            </span>
          </div>

          {/* Action Buttons (Save/Update Table & Checkout) */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              onClick={handleOpenSaveTable}
              disabled={cart.length === 0}
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                backgroundColor: userRole === 'mozo' ? 'var(--primary-green)' : '',
                color: userRole === 'mozo' ? 'var(--text-light)' : '',
                borderColor: userRole === 'mozo' ? 'var(--primary-green)' : ''
              }}
            >
              {activeTableId ? 'Actualizar Mesa' : 'Guardar Mesa'}
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="btn btn-primary"
                style={{
                  flex: 1.5,
                  padding: '12px',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Cobrar
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Modificar Nota</h3>
              <button className="modal-close-btn" onClick={() => setShowNoteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Indicaciones para {selectedCartItem?.product.name} (Ej: "leche de almendras", "tibio", "con edulcorante").
              </p>
              <input
                type="text"
                className="input"
                placeholder="Ej: Leche descremada y tibio"
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveNote}>Guardar Nota</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Confirmar Cobro</h3>
              <button className="modal-close-btn" onClick={() => setShowCheckoutModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Box closed alert warning */}
              {!cajaActiva && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(168, 74, 50, 0.08)',
                  border: '1px solid rgba(168, 74, 50, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger-rust)',
                  fontSize: '0.85rem'
                }}>
                  <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px' }}>Caja Cerrada</strong>
                    Se registrará la venta en el historial pero no afectará el saldo de caja física. Te sugerimos abrir la caja desde la sección "Caja y Arqueo" antes de realizar el cobro.
                  </div>
                </div>
              )}

              {/* Order total info */}
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(30, 63, 32, 0.03)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                border: '1px dashed var(--border-color)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL A PAGAR</span>
                <h2 style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary-green)',
                  marginTop: '4px'
                }}>
                  {formatCurrency(total)}
                </h2>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  MÉTODO DE PAGO
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                    <label 
                      key={method}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        border: `1px solid ${metodoPago === method ? 'var(--primary-green)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: metodoPago === method ? 'rgba(30, 63, 32, 0.04)' : 'var(--bg-input)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="radio" 
                          name="payment_method" 
                          value={method} 
                          checked={metodoPago === method}
                          onChange={() => setMetodoPago(method)}
                          style={{ accentColor: 'var(--primary-green)' }}
                        />
                        <span>{method === 'Transferencia' ? 'Mercado Pago / Transf.' : method}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {method === 'Efectivo' ? 'Registra en caja física' : 'Otros ingresos'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmSale}>Confirmar Venta</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && lastSale && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Venta Realizada</h3>
              <button className="modal-close-btn" onClick={() => {
                setShowTicketModal(false);
                setLastSale(null);
              }}>×</button>
            </div>
            
            {/* Modal Body with visual preview of ticket */}
            <div className="modal-body">
              <p style={{
                textAlign: 'center',
                color: 'var(--primary-green)',
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: '20px'
              }}>
                ¡Cobro exitoso! Podés imprimir el ticket para la cocina o el cliente.
              </p>

              {/* Receipt Visual Simulator container */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                padding: '24px 16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#000000',
                boxShadow: 'var(--shadow-soft)',
                borderRadius: '4px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>RISTRETTO COFFEE</h4>
                  <p style={{ fontSize: '10px' }}>Chapadmalal</p>
                  <p style={{ fontSize: '10px', marginTop: '4px' }}>Ticket No Fiscal</p>
                </div>
                
                <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div>Nro: {lastSale.id}</div>
                  <div>Fecha: {new Date(lastSale.fecha).toLocaleString('es-AR')}</div>
                  <div>Pago: {lastSale.metodoPago}</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Detalle</th>
                      <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Cant</th>
                      <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSale.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr>
                          <td style={{ paddingTop: '4px' }}>{item.name}</td>
                          <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', paddingTop: '4px' }}>{formatCurrency(item.subtotal)}</td>
                        </tr>
                        {item.customNote && (
                          <tr>
                            <td colSpan="3" style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', paddingLeft: '8px' }}>
                              * {item.customNote}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {lastSale.descuentoMonto > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(lastSale.subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Desc ({lastSale.descuentoPorcentaje}%):</span>
                        <span>-{formatCurrency(lastSale.descuentoMonto)}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                    <span>TOTAL:</span>
                    <span>{formatCurrency(lastSale.total)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '10px' }}>
                  <p>¡Muchas gracias por su compra!</p>
                  <p>instagram: ristrettochapa.ok</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setShowTicketModal(false);
                setLastSale(null);
              }}>Cerrar</button>
              
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={16} />
                Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Table Modal */}
      {showSaveTableModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Guardar en Mesa / Pedido</h3>
              <button className="modal-close-btn" onClick={() => setShowSaveTableModal(false)}>×</button>
            </div>
            <form onSubmit={handleConfirmSaveTable}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Identificá este pedido con un número de mesa o el nombre del cliente para recuperarlo más tarde.
                </p>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Mesa 3, Juan Carlos, Barra"
                  value={tableNameInput}
                  onChange={(e) => setTableNameInput(e.target.value)}
                  maxLength={30}
                  autoFocus
                />
                {saveErrors && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                    {saveErrors}
                  </span>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSaveTableModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Hidden print-only layout triggered during print media action */}
      {lastSale && (
        <div className="print-only" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '80mm', /* or 58mm depending on printer configuration, 80mm standard */
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#000000',
          padding: '10px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px' }}>RISTRETTO COFFEE</h2>
            <p style={{ fontSize: '10px', margin: 0 }}>Chapadmalal</p>
            <p style={{ fontSize: '10px', margin: '4px 0 0' }}>Ticket Comercial - No Fiscal</p>
          </div>
          
          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px', fontSize: '11px' }}>
            <div>Nro Comprobante: {lastSale.id}</div>
            <div>Fecha y Hora: {new Date(lastSale.fecha).toLocaleString('es-AR')}</div>
            <div>Método Pago: {lastSale.metodoPago}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Descripción</th>
                <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Cant</th>
                <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {lastSale.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td style={{ paddingTop: '4px' }}>{item.name}</td>
                    <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', paddingTop: '4px' }}>{formatCurrency(item.subtotal)}</td>
                  </tr>
                  {item.customNote && (
                    <tr>
                      <td colSpan="3" style={{ fontSize: '10px', color: '#666', fontStyle: 'italic', paddingLeft: '8px' }}>
                        * Nota: {item.customNote}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {lastSale.descuentoMonto > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(lastSale.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Descuento ({lastSale.descuentoPorcentaje}%):</span>
                  <span>-{formatCurrency(lastSale.descuentoMonto)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #000', paddingTop: '4px' }}>
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(lastSale.total)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '10px' }}>
            <p>¡Muchas gracias por elegirnos!</p>
            <p>instagram: ristrettochapa.ok</p>
          </div>
        </div>
      )}

      {/* Hidden print-only layout for kitchen comanda */}
      {activeTableForComanda && (
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
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 2px' }}>*** COMANDA DE COCINA ***</h2>
            <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Mesa / Pedido: {activeTableForComanda.id}</p>
            <p style={{ fontSize: '10px', margin: '2px 0 0' }}>Hora: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div style={{ borderBottom: '1px dashed #000', marginBottom: '8px' }}></div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'center', width: '40px', paddingBottom: '4px' }}>Cant</th>
                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Producto</th>
              </tr>
            </thead>
            <tbody>
              {activeTableForComanda.items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', padding: '6px 0' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '6px 0', fontSize: '13px' }}>
                      {item.product.name}
                    </td>
                  </tr>
                  {item.customNote && (
                    <tr>
                      <td></td>
                      <td style={{ fontSize: '11px', color: '#000', fontWeight: 'bold', paddingBottom: '6px', fontStyle: 'italic' }}>
                        * NOTA: {item.customNote}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed #000', marginTop: '10px', padding: '8px 0', textAlign: 'center', fontSize: '10px' }}>
            <p>Ristretto Coffee • Chapadmalal</p>
          </div>
        </div>
      )}

      {/* Mobile Floating Cart Button (only on mobile) */}
      {cart.length > 0 && (
        <div className="mobile-only-cart-button no-print" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 90
        }}>
          <button 
            onClick={() => setShowCartMobile(true)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px rgba(30, 63, 32, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} />
              <span>Ver Pedido</span>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem'
              }}>
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <strong>{formatCurrency(total)}</strong>
          </button>
        </div>
      )}
    </div>
  );
};

export default POS;
