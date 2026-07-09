import React, { createContext, useContext, useState, useEffect } from 'react';

const RistrettoContext = createContext();

const DEFAULT_PRODUCTS = [
  // Cafetería
  { id: '1', name: 'Espresso', category: 'Cafetería', costPrice: 400, sellPrice: 1800, stock: 99, trackStock: false },
  { id: '2', name: 'Double Espresso', category: 'Cafetería', costPrice: 600, sellPrice: 2200, stock: 99, trackStock: false },
  { id: '3', name: 'Americano', category: 'Cafetería', costPrice: 500, sellPrice: 2300, stock: 99, trackStock: false },
  { id: '4', name: 'Flat White', category: 'Cafetería', costPrice: 800, sellPrice: 2800, stock: 99, trackStock: false },
  { id: '5', name: 'Latte', category: 'Cafetería', costPrice: 800, sellPrice: 2900, stock: 99, trackStock: false },
  { id: '6', name: 'Cappuccino', category: 'Cafetería', costPrice: 800, sellPrice: 2900, stock: 99, trackStock: false },
  { id: '7', name: 'Cold Brew Tonic', category: 'Cafetería', costPrice: 900, sellPrice: 2800, stock: 50, trackStock: true },
  
  // Pastelería
  { id: '8', name: 'Croissant clásico', category: 'Pastelería', costPrice: 500, sellPrice: 1500, stock: 24, trackStock: true },
  { id: '9', name: 'Medialuna de almendras', category: 'Pastelería', costPrice: 600, sellPrice: 1700, stock: 15, trackStock: true },
  { id: '10', name: 'Alfajor de pistacho', category: 'Pastelería', costPrice: 700, sellPrice: 2000, stock: 10, trackStock: true },
  { id: '11', name: 'Cookie Triple Chips', category: 'Pastelería', costPrice: 400, sellPrice: 1300, stock: 30, trackStock: true },
  { id: '12', name: 'Roll de Canela', category: 'Pastelería', costPrice: 550, sellPrice: 1800, stock: 12, trackStock: true },
  
  // Salados / Comida
  { id: '13', name: 'Tostado Jamón y Queso', category: 'Comida', costPrice: 1200, sellPrice: 3500, stock: 20, trackStock: true },
  { id: '14', name: 'Avocado Toast', category: 'Comida', costPrice: 1500, sellPrice: 4200, stock: 15, trackStock: true },
  { id: '15', name: 'Sandwich Ristretto', category: 'Comida', costPrice: 2000, sellPrice: 5500, stock: 10, trackStock: true },
  
  // Bebidas
  { id: '16', name: 'Limonada Menta y Jengibre', category: 'Bebidas', costPrice: 500, sellPrice: 2400, stock: 40, trackStock: true },
  { id: '17', name: 'Agua sin gas', category: 'Bebidas', costPrice: 400, sellPrice: 1500, stock: 60, trackStock: true }
];

export const RistrettoProvider = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core States
  const [menu, setMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_menu');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
      return Array.isArray(parsed) ? parsed : DEFAULT_PRODUCTS;
    } catch (e) {
      console.error('Error parsing menu from localStorage:', e);
      return DEFAULT_PRODUCTS;
    }
  });

  const [ventas, setVentas] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_ventas');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing ventas from localStorage:', e);
      return [];
    }
  });

  const [gastos, setGastos] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_gastos');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing gastos from localStorage:', e);
      return [];
    }
  });

  const [cajaActiva, setCajaActiva] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_caja_activa');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing cajaActiva from localStorage:', e);
      return null;
    }
  });

  const [arqueos, setArqueos] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_arqueos');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing arqueos from localStorage:', e);
      return [];
    }
  });

  const [pedidosActivos, setPedidosActivos] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_pedidos_activos');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing pedidosActivos from localStorage:', e);
      return [];
    }
  });

  const [categorias, setCategorias] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_categorias');
      const parsed = saved ? JSON.parse(saved) : ['Cafetería', 'Pastelería', 'Comida', 'Bebidas'];
      return Array.isArray(parsed) ? parsed : ['Cafetería', 'Pastelería', 'Comida', 'Bebidas'];
    } catch (e) {
      console.error('Error parsing categorias from localStorage:', e);
      return ['Cafetería', 'Pastelería', 'Comida', 'Bebidas'];
    }
  });

  const [authCredentials, setAuthCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('ristretto_auth_credentials');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'ristretto.chapa' };
    } catch (e) {
      return { username: 'admin', password: 'ristretto.chapa' };
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('ristretto_auth') === 'true';
  });

  // POS Cart State
  const [cart, setCart] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0); // Porcentaje de descuento global (0 a 100)

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('ristretto_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('ristretto_ventas', JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem('ristretto_gastos', JSON.stringify(gastos));
  }, [gastos]);

  useEffect(() => {
    localStorage.setItem('ristretto_caja_activa', JSON.stringify(cajaActiva));
  }, [cajaActiva]);

  useEffect(() => {
    localStorage.setItem('ristretto_arqueos', JSON.stringify(arqueos));
  }, [arqueos]);

  useEffect(() => {
    localStorage.setItem('ristretto_pedidos_activos', JSON.stringify(pedidosActivos));
  }, [pedidosActivos]);

  useEffect(() => {
    localStorage.setItem('ristretto_categorias', JSON.stringify(categorias));
  }, [categorias]);

  useEffect(() => {
    localStorage.setItem('ristretto_auth_credentials', JSON.stringify(authCredentials));
  }, [authCredentials]);

  // MENU CRUD
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      costPrice: parseFloat(product.costPrice) || 0,
      sellPrice: parseFloat(product.sellPrice) || 0,
      stock: parseInt(product.stock) || 0,
      trackStock: !!product.trackStock
    };
    setMenu(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct) => {
    setMenu(prev => prev.map(p => p.id === updatedProduct.id ? {
      ...updatedProduct,
      costPrice: parseFloat(updatedProduct.costPrice) || 0,
      sellPrice: parseFloat(updatedProduct.sellPrice) || 0,
      stock: parseInt(updatedProduct.stock) || 0,
      trackStock: !!updatedProduct.trackStock
    } : p));
  };

  const deleteProduct = (id) => {
    setMenu(prev => prev.filter(p => p.id !== id));
  };

  // CATEGORIES LOGIC
  const addCategoria = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategorias(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
  };

  const deleteCategoria = (name) => {
    // Evitamos borrar las categorías por defecto si queremos, o simplemente permitimos todo
    setCategorias(prev => prev.filter(c => c !== name));
  };

  // AUTH LOGIC
  const login = (username, password) => {
    if (username.trim() === authCredentials.username && password === authCredentials.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ristretto_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ristretto_auth');
  };

  const updateCredentials = (newUsername, newPassword) => {
    setAuthCredentials({
      username: newUsername.trim() || 'admin',
      password: newPassword || 'ristretto.chapa'
    });
  };

  const resetDatos = () => {
    setVentas([]);
    setGastos([]);
    setCajaActiva(null);
    setArqueos([]);
    setPedidosActivos([]);
  };

  // ACTIVE TABLE ORDERS LOGIC
  const guardarPedidoActivo = (id, items, discount = 0) => {
    setPedidosActivos(prev => {
      const existing = prev.find(p => p.id === id);
      if (existing) {
        return prev.map(p => p.id === id ? { ...p, items, discount } : p);
      }
      return [...prev, {
        id,
        items,
        discount,
        fechaApertura: new Date().toISOString()
      }];
    });
  };

  const eliminarPedidoActivo = (id) => {
    setPedidosActivos(prev => prev.filter(p => p.id !== id));
  };

  // CART LOGIC
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && !item.customNote);
      if (existing) {
        return prev.map(item => 
          (item.product.id === product.id && !item.customNote) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1, customNote: '' }];
    });
  };

  const updateCartQuantity = (productId, quantity, customNote = '') => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => !(item.product.id === productId && item.customNote === customNote)));
      return;
    }
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.customNote === customNote)
        ? { ...item, quantity }
        : item
    ));
  };

  const updateCartItemNote = (productId, oldNote, newNote) => {
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.customNote === oldNote)
        ? { ...item, customNote: newNote }
        : item
    ));
  };

  const removeFromCart = (productId, customNote = '') => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.customNote === customNote)));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
  };

  // CAJA (CASH DRAWER) MANAGEMENT
  const abrirCaja = (montoInicial) => {
    const nuevaCaja = {
      fechaApertura: new Date().toISOString(),
      montoInicial: parseFloat(montoInicial) || 0,
      ingresosManuales: [], // { id, monto, descripcion, fecha }
      egresosManuales: [],  // { id, monto, descripcion, fecha }
      ventasEfectivo: 0,
      ventasOtros: 0 // Tarjeta, Transferencia, etc.
    };
    setCajaActiva(nuevaCaja);
  };

  const registrarMovimientoCaja = (tipo, monto, descripcion) => {
    if (!cajaActiva) return;
    const mov = {
      id: Date.now().toString(),
      monto: parseFloat(monto) || 0,
      descripcion: descripcion || '',
      fecha: new Date().toISOString()
    };

    setCajaActiva(prev => {
      const key = tipo === 'ingreso' ? 'ingresosManuales' : 'egresosManuales';
      return {
        ...prev,
        [key]: [...prev[key], mov]
      };
    });
  };

  const cerrarCaja = (efectivoRealContado) => {
    if (!cajaActiva) return null;

    const totalIngresosManuales = cajaActiva.ingresosManuales.reduce((acc, curr) => acc + curr.monto, 0);
    const totalEgresosManuales = cajaActiva.egresosManuales.reduce((acc, curr) => acc + curr.monto, 0);
    const totalVentasEfectivo = cajaActiva.ventasEfectivo;
    
    // El efectivo esperado físico en caja es:
    // Monto inicial + ventas en efectivo + ingresos manuales de efectivo - egresos manuales de efectivo
    const efectivoEsperado = cajaActiva.montoInicial + totalVentasEfectivo + totalIngresosManuales - totalEgresosManuales;
    const diferencia = efectivoRealContado - efectivoEsperado;

    const arqueoCerrado = {
      id: Date.now().toString(),
      fechaApertura: cajaActiva.fechaApertura,
      fechaCierre: new Date().toISOString(),
      montoInicial: cajaActiva.montoInicial,
      ventasEfectivo: totalVentasEfectivo,
      ventasOtros: cajaActiva.ventasOtros,
      ingresosManuales: cajaActiva.ingresosManuales,
      egresosManuales: cajaActiva.egresosManuales,
      efectivoEsperado,
      efectivoReal: efectivoRealContado,
      diferencia,
      resultado: diferencia === 0 ? 'Balanceado' : diferencia > 0 ? 'Sobrante' : 'Faltante'
    };

    setArqueos(prev => [arqueoCerrado, ...prev]);
    setCajaActiva(null);
    return arqueoCerrado;
  };

  // COMPLETE SALE (CHECKOUT)
  const realizarVenta = (metodoPago, totalVendido) => {
    if (cart.length === 0) return null;

    // Calcular costos e importes
    let totalOriginal = 0;
    const items = cart.map(item => {
      const itemSubtotal = item.product.sellPrice * item.quantity;
      totalOriginal += itemSubtotal;
      return {
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        sellPrice: item.product.sellPrice,
        costPrice: item.product.costPrice,
        customNote: item.customNote,
        subtotal: itemSubtotal
      };
    });

    const descuentoMonto = totalOriginal * (cartDiscount / 100);
    const totalFinal = totalOriginal - descuentoMonto;
    const totalCosto = items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
    const ganancia = totalFinal - totalCosto;

    const nuevaVenta = {
      id: `V-${Date.now()}`,
      fecha: new Date().toISOString(),
      items,
      subtotal: totalOriginal,
      descuentoPorcentaje: cartDiscount,
      descuentoMonto,
      total: totalFinal,
      costo: totalCosto,
      ganancia,
      metodoPago // 'Efectivo', 'Tarjeta', 'Transferencia'
    };

    // 1. Agregar a ventas históricas
    setVentas(prev => [nuevaVenta, ...prev]);

    // 2. Descontar stock
    setMenu(prevMenu => prevMenu.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem && p.trackStock) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));

    // 3. Impactar en la caja activa (si existe)
    if (cajaActiva) {
      setCajaActiva(prev => {
        if (metodoPago === 'Efectivo') {
          return { ...prev, ventasEfectivo: prev.ventasEfectivo + totalFinal };
        } else {
          return { ...prev, ventasOtros: prev.ventasOtros + totalFinal };
        }
      });
    }

    // 4. Limpiar Carrito
    clearCart();

    return nuevaVenta;
  };

  // ADD EXPENSE
  const addGasto = (gasto) => {
    const nuevoGasto = {
      id: Date.now().toString(),
      fecha: gasto.fecha || new Date().toISOString().slice(0, 10),
      monto: parseFloat(gasto.monto) || 0,
      categoria: gasto.categoria || 'Varios', // 'Insumos', 'Servicios', 'Sueldos', 'Alquiler', 'Varios'
      descripcion: gasto.descripcion || '',
      cajaAfectada: !!gasto.cajaAfectada // Si se pagó con efectivo de caja activa
    };

    setGastos(prev => [nuevoGasto, ...prev]);

    // Si afectó a la caja activa, registrar egreso
    if (nuevoGasto.cajaAfectada && cajaActiva) {
      registrarMovimientoCaja('egreso', nuevoGasto.monto, `Gasto: ${nuevoGasto.descripcion} (${nuevoGasto.categoria})`);
    }
  };

  const deleteGasto = (id) => {
    // Si queremos eliminarlo, lo quitamos de la lista
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  // IMPORT & EXPORT DATA (BACKUP)
  const exportData = () => {
    const dataStr = JSON.stringify({
      menu,
      ventas,
      gastos,
      cajaActiva,
      arqueos,
      pedidosActivos,
      categorias
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ristretto_backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.menu) setMenu(data.menu);
      if (data.ventas) setVentas(data.ventas);
      if (data.gastos) setGastos(data.gastos);
      setCajaActiva(data.cajaActiva || null);
      if (data.arqueos) setArqueos(data.arqueos);
      if (data.pedidosActivos) setPedidosActivos(data.pedidosActivos);
      if (data.categorias) setCategorias(data.categorias);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <RistrettoContext.Provider value={{
      activeTab,
      setActiveTab,
      
      menu,
      addProduct,
      updateProduct,
      deleteProduct,
      
      cart,
      setCart,
      cartDiscount,
      setCartDiscount,
      addToCart,
      updateCartQuantity,
      updateCartItemNote,
      removeFromCart,
      clearCart,
      realizarVenta,
      
      gastos,
      addGasto,
      deleteGasto,
      
      cajaActiva,
      abrirCaja,
      registrarMovimientoCaja,
      cerrarCaja,
      arqueos,
      
      pedidosActivos,
      guardarPedidoActivo,
      eliminarPedidoActivo,
      
      categorias,
      addCategoria,
      deleteCategoria,
      
      authCredentials,
      isAuthenticated,
      login,
      logout,
      updateCredentials,
      resetDatos,
      
      exportData,
      importData
    }}>
      {children}
    </RistrettoContext.Provider>
  );
};

export const useRistretto = () => useContext(RistrettoContext);
