import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

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
  // Core States
  const [menu, setMenu] = useState(DEFAULT_PRODUCTS);
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cajaActiva, setCajaActiva] = useState(null);
  const [arqueos, setArqueos] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [categorias, setCategorias] = useState(['Cafetería', 'Pastelería', 'Comida', 'Bebidas']);
  const [authCredentials, setAuthCredentials] = useState({ username: 'admin', password: 'ristretto.chapa' });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('ristretto_auth') === 'true';
  });

  // POS Cart State
  const [cart, setCart] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0); // Porcentaje de descuento global (0 a 100)

  // Firestore Sync Listeners
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (items.length > 0) {
        setMenu(items);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ventas"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setVentas(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "gastos"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setGastos(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "estado", "cajaActiva"), (docSnap) => {
      if (docSnap.exists()) {
        setCajaActiva(docSnap.data());
      } else {
        setCajaActiva(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "arqueos"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.fechaCierre) - new Date(a.fechaCierre));
      setArqueos(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pedidosActivos"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPedidosActivos(items);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categorias"), (snapshot) => {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data().name);
      });
      if (items.length > 0) {
        setCategorias(items);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "estado", "authCredentials"), (docSnap) => {
      if (docSnap.exists()) {
        setAuthCredentials(docSnap.data());
      }
    });
    return unsub;
  }, []);

  // MENU CRUD
  const addProduct = async (product) => {
    const id = Date.now().toString();
    const newProduct = {
      id,
      name: product.name,
      category: product.category,
      costPrice: parseFloat(product.costPrice) || 0,
      sellPrice: parseFloat(product.sellPrice) || 0,
      stock: parseInt(product.stock) || 0,
      trackStock: !!product.trackStock
    };
    await setDoc(doc(db, "menu", id), newProduct);
  };

  const updateProduct = async (updatedProduct) => {
    const p = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      category: updatedProduct.category,
      costPrice: parseFloat(updatedProduct.costPrice) || 0,
      sellPrice: parseFloat(updatedProduct.sellPrice) || 0,
      stock: parseInt(updatedProduct.stock) || 0,
      trackStock: !!updatedProduct.trackStock
    };
    await setDoc(doc(db, "menu", updatedProduct.id), p);
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "menu", id));
  };

  // CATEGORIES LOGIC
  const addCategoria = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await setDoc(doc(db, "categorias", trimmed), { name: trimmed });
  };

  const deleteCategoria = async (name) => {
    await deleteDoc(doc(db, "categorias", name));
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

  const updateCredentials = async (newUsername, newPassword) => {
    await setDoc(doc(db, "estado", "authCredentials"), {
      username: newUsername.trim() || 'admin',
      password: newPassword || 'ristretto.chapa'
    });
  };

  const resetDatos = async () => {
    const batch = writeBatch(db);
    
    const ventasSnaps = await getDocs(collection(db, "ventas"));
    ventasSnaps.forEach(docSnap => batch.delete(doc(db, "ventas", docSnap.id)));

    const gastosSnaps = await getDocs(collection(db, "gastos"));
    gastosSnaps.forEach(docSnap => batch.delete(doc(db, "gastos", docSnap.id)));

    const arqueosSnaps = await getDocs(collection(db, "arqueos"));
    arqueosSnaps.forEach(docSnap => batch.delete(doc(db, "arqueos", docSnap.id)));

    const pedidosSnaps = await getDocs(collection(db, "pedidosActivos"));
    pedidosSnaps.forEach(docSnap => batch.delete(doc(db, "pedidosActivos", docSnap.id)));

    batch.delete(doc(db, "estado", "cajaActiva"));

    await batch.commit();
  };

  // ACTIVE TABLE ORDERS LOGIC
  const guardarPedidoActivo = async (id, items, discount = 0) => {
    const existing = pedidosActivos.find(p => p.id === id);
    const fechaApertura = existing ? existing.fechaApertura : new Date().toISOString();
    await setDoc(doc(db, "pedidosActivos", id), {
      id,
      items,
      discount,
      fechaApertura
    });
  };

  const eliminarPedidoActivo = async (id) => {
    await deleteDoc(doc(db, "pedidosActivos", id));
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
  const abrirCaja = async (montoInicial) => {
    const nuevaCaja = {
      fechaApertura: new Date().toISOString(),
      montoInicial: parseFloat(montoInicial) || 0,
      ingresosManuales: [],
      egresosManuales: [],
      ventasEfectivo: 0,
      ventasOtros: 0
    };
    await setDoc(doc(db, "estado", "cajaActiva"), nuevaCaja);
  };

  const registrarMovimientoCaja = async (tipo, monto, descripcion) => {
    if (!cajaActiva) return;
    const mov = {
      id: Date.now().toString(),
      monto: parseFloat(monto) || 0,
      descripcion: descripcion || '',
      fecha: new Date().toISOString()
    };
    const key = tipo === 'ingreso' ? 'ingresosManuales' : 'egresosManuales';
    const updatedCaja = {
      ...cajaActiva,
      [key]: [...(cajaActiva[key] || []), mov]
    };
    await setDoc(doc(db, "estado", "cajaActiva"), updatedCaja);
  };

  const cerrarCaja = async (efectivoRealContado) => {
    if (!cajaActiva) return null;

    const totalIngresosManuales = (cajaActiva.ingresosManuales || []).reduce((acc, curr) => acc + curr.monto, 0);
    const totalEgresosManuales = (cajaActiva.egresosManuales || []).reduce((acc, curr) => acc + curr.monto, 0);
    const totalVentasEfectivo = cajaActiva.ventasEfectivo || 0;
    
    const efectivoEsperado = cajaActiva.montoInicial + totalVentasEfectivo + totalIngresosManuales - totalEgresosManuales;
    const diferencia = efectivoRealContado - efectivoEsperado;

    const id = Date.now().toString();
    const arqueoCerrado = {
      id,
      fechaApertura: cajaActiva.fechaApertura,
      fechaCierre: new Date().toISOString(),
      montoInicial: cajaActiva.montoInicial,
      ventasEfectivo: totalVentasEfectivo,
      ventasOtros: cajaActiva.ventasOtros || 0,
      ingresosManuales: cajaActiva.ingresosManuales || [],
      egresosManuales: cajaActiva.egresosManuales || [],
      efectivoEsperado,
      efectivoReal: efectivoRealContado,
      diferencia,
      resultado: diferencia === 0 ? 'Balanceado' : diferencia > 0 ? 'Sobrante' : 'Faltante'
    };

    await setDoc(doc(db, "arqueos", id), arqueoCerrado);
    await deleteDoc(doc(db, "estado", "cajaActiva"));
    return arqueoCerrado;
  };

  // COMPLETE SALE (CHECKOUT)
  const realizarVenta = async (metodoPago, totalVendido) => {
    if (cart.length === 0) return null;

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

    const id = `V-${Date.now()}`;
    const nuevaVenta = {
      id,
      fecha: new Date().toISOString(),
      items,
      subtotal: totalOriginal,
      descuentoPorcentaje: cartDiscount,
      descuentoMonto,
      total: totalFinal,
      costo: totalCosto,
      ganancia,
      metodoPago
    };

    await setDoc(doc(db, "ventas", id), nuevaVenta);

    for (const item of cart) {
      if (item.product.trackStock) {
        const productRef = doc(db, "menu", item.product.id);
        const currentProd = menu.find(p => p.id === item.product.id);
        if (currentProd) {
          await setDoc(productRef, {
            ...currentProd,
            stock: Math.max(0, currentProd.stock - item.quantity)
          });
        }
      }
    }

    if (cajaActiva) {
      const updatedCaja = {
        ...cajaActiva,
        ventasEfectivo: metodoPago === 'Efectivo' ? (cajaActiva.ventasEfectivo || 0) + totalFinal : (cajaActiva.ventasEfectivo || 0),
        ventasOtros: metodoPago !== 'Efectivo' ? (cajaActiva.ventasOtros || 0) + totalFinal : (cajaActiva.ventasOtros || 0)
      };
      await setDoc(doc(db, "estado", "cajaActiva"), updatedCaja);
    }

    clearCart();
    return nuevaVenta;
  };

  // ADD EXPENSE
  const addGasto = async (gasto) => {
    const id = Date.now().toString();
    const nuevoGasto = {
      id,
      fecha: gasto.fecha || new Date().toISOString().slice(0, 10),
      monto: parseFloat(gasto.monto) || 0,
      categoria: gasto.categoria || 'Varios',
      descripcion: gasto.descripcion || '',
      cajaAfectada: !!gasto.cajaAfectada
    };

    await setDoc(doc(db, "gastos", id), nuevoGasto);

    if (nuevoGasto.cajaAfectada && cajaActiva) {
      await registrarMovimientoCaja('egreso', nuevoGasto.monto, `Gasto: ${nuevoGasto.descripcion} (${nuevoGasto.categoria})`);
    }
  };

  const deleteGasto = async (id) => {
    await deleteDoc(doc(db, "gastos", id));
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

  const importData = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      const batch = writeBatch(db);

      if (Array.isArray(data.menu)) {
        data.menu.forEach(p => {
          batch.set(doc(db, "menu", p.id), p);
        });
      }
      if (Array.isArray(data.ventas)) {
        data.ventas.forEach(v => {
          batch.set(doc(db, "ventas", v.id), v);
        });
      }
      if (Array.isArray(data.gastos)) {
        data.gastos.forEach(g => {
          batch.set(doc(db, "gastos", g.id), g);
        });
      }
      if (data.cajaActiva) {
        batch.set(doc(db, "estado", "cajaActiva"), data.cajaActiva);
      } else {
        batch.delete(doc(db, "estado", "cajaActiva"));
      }
      if (Array.isArray(data.arqueos)) {
        data.arqueos.forEach(a => {
          batch.set(doc(db, "arqueos", a.id), a);
        });
      }
      if (Array.isArray(data.pedidosActivos)) {
        data.pedidosActivos.forEach(pa => {
          batch.set(doc(db, "pedidosActivos", pa.id), pa);
        });
      }
      if (Array.isArray(data.categorias)) {
        data.categorias.forEach(c => {
          batch.set(doc(db, "categorias", c), { name: c });
        });
      }

      await batch.commit();
      return { success: true };
    } catch (e) {
      console.error("Error importing backup to Firestore:", e);
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
