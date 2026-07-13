import React, { useState } from 'react';
import { useRistretto } from '../context/RistrettoContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Search, 
  Layers, 
  Check, 
  X 
} from 'lucide-react';

const Menu = () => {
  const { 
    menu, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    categorias,
    addCategoria,
    deleteCategoria
  } = useRistretto();

  // Search & Category filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Category management modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryErrors, setCategoryErrors] = useState('');

  // Dynamic Categories Lists
  const categories = ['Todos', ...(Array.isArray(categorias) ? categorias : [])];
  const formCategories = Array.isArray(categorias) ? categorias : [];

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    category: formCategories[0] || 'Varios',
    costPrice: '',
    sellPrice: '',
    trackStock: false,
    stock: ''
  });

  // Errors State
  const [formErrors, setFormErrors] = useState({});

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filter menu items
  const filteredProducts = menu.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Modal to Add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: formCategories[0] || 'Varios',
      costPrice: '',
      sellPrice: '',
      trackStock: false,
      stock: '0'
    });
    setFormErrors({});
    setShowAddEditModal(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      trackStock: product.trackStock,
      stock: product.stock.toString()
    });
    setFormErrors({});
    setShowAddEditModal(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteProduct(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate and Save
  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.sellPrice || parseFloat(formData.sellPrice) <= 0) errors.sellPrice = 'El precio de venta debe ser mayor a 0';
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) errors.costPrice = 'El precio de costo no puede ser negativo';
    if (formData.trackStock && (parseInt(formData.stock) < 0 || isNaN(parseInt(formData.stock)))) {
      errors.stock = 'El stock debe ser un número válido igual o mayor a 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellPrice: parseFloat(formData.sellPrice) || 0,
      trackStock: formData.trackStock,
      stock: formData.trackStock ? parseInt(formData.stock) || 0 : 99 // default high stock if untracked
    };

    if (editingProduct) {
      updateProduct({ ...payload, id: editingProduct.id });
    } else {
      addProduct(payload);
    }

    setShowAddEditModal(false);
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
            Gestión de Menú
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            Administrá los productos de la cafetería, costos, precios y control de stock
          </p>
        </div>
        
        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            <Layers size={16} />
            Categorías
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            Agregar Producto
          </button>
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
        {/* Search Input */}
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
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Categories Tabs */}
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

      {/* Products Table Card */}
      <div className="card" style={{ padding: '0px', overflowX: 'auto' }}>
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
              <th style={{ padding: '16px 24px' }}>Producto</th>
              <th style={{ padding: '16px 24px' }}>Categoría</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Costo</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Venta</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Margen</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Stock</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                  color: 'var(--text-muted)'
                }}>
                  No se encontraron productos en el menú.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const markup = product.sellPrice - product.costPrice;
                const marginPercentage = product.sellPrice > 0 ? Math.round((markup / product.sellPrice) * 100) : 0;
                const isLowStock = product.trackStock && product.stock <= 5;
                const isOutOfStock = product.trackStock && product.stock <= 0;

                return (
                  <tr key={product.id} style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color var(--transition-fast)'
                  }} className="table-row-hover">
                    
                    {/* Name */}
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                      {product.name}
                    </td>
                    
                    {/* Category */}
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                        {product.category}
                      </span>
                    </td>
                    
                    {/* Cost */}
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(product.costPrice)}
                    </td>
                    
                    {/* Sell Price */}
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatCurrency(product.sellPrice)}
                    </td>
                    
                    {/* Profit Margin */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                        {formatCurrency(markup)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({marginPercentage}%)
                      </span>
                    </td>
                    
                    {/* Stock */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      {product.trackStock ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span style={{
                            fontWeight: 700,
                            color: isOutOfStock ? 'var(--danger-rust)' : isLowStock ? '#b07945' : 'var(--text-dark)'
                          }}>
                            {product.stock}
                          </span>
                          {isOutOfStock ? (
                            <span className="badge badge-rust" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Agotado</span>
                          ) : isLowStock ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Bajo</span>
                          ) : null}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Ilimitado</span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="btn btn-secondary btn-icon-only"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(product.id)}
                          className="btn btn-danger btn-icon-only"
                          style={{ backgroundColor: 'transparent', borderColor: 'var(--danger-rust)', color: 'var(--danger-rust)' }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Product Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    placeholder="Ej. Latte Vainilla, Roll de Canela"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                      {formErrors.name}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Categoría
                  </label>
                  <select
                    name="category"
                    className="input"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {formCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Prices Row */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Cost Price */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Precio de Costo ($)
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      className="input"
                      placeholder="0"
                      value={formData.costPrice}
                      onChange={handleChange}
                      min="0"
                      step="any"
                    />
                    {formErrors.costPrice && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                        {formErrors.costPrice}
                      </span>
                    )}
                  </div>

                  {/* Sell Price */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Precio de Venta ($) *
                    </label>
                    <input
                      type="number"
                      name="sellPrice"
                      className="input"
                      placeholder="0"
                      value={formData.sellPrice}
                      onChange={handleChange}
                      min="0"
                      step="any"
                    />
                    {formErrors.sellPrice && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                        {formErrors.sellPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Controls */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(30, 63, 32, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '4px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      name="trackStock"
                      checked={formData.trackStock}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--primary-green)' }}
                    />
                    Habilitar control de stock
                  </label>
                  
                  {formData.trackStock && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Cantidad en Stock actual
                      </label>
                      <input
                        type="number"
                        name="stock"
                        className="input"
                        placeholder="0"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                      />
                      {formErrors.stock && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                          {formErrors.stock}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger-rust)' }}>¿Eliminar Producto?</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>
                ¿Estás seguro de que querés eliminar este producto del menú? Esta acción no se puede deshacer y el producto ya no aparecerá en el punto de venta.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Gestionar Categorías</h3>
              <button className="modal-close-btn" onClick={() => setShowCategoryModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Add Category Form */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Nueva Categoría
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej. PROMOS, Café Frío, Combos..."
                    value={newCategoryInput}
                    onChange={(e) => {
                      setNewCategoryInput(e.target.value);
                      setCategoryErrors('');
                    }}
                    maxLength={20}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const trimmed = newCategoryInput.trim();
                      if (!trimmed) {
                        setCategoryErrors('El nombre no puede estar vacío');
                        return;
                      }
                      if (categorias.includes(trimmed)) {
                        setCategoryErrors('La categoría ya existe');
                        return;
                      }
                      addCategoria(trimmed);
                      setNewCategoryInput('');
                    }}
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Agregar
                  </button>
                </div>
                {categoryErrors && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger-rust)', marginTop: '4px', display: 'block' }}>
                    {categoryErrors}
                  </span>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Categories list */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  CATEGORÍAS DE LA CAFETERÍA
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {categorias.map(cat => {
                    const inUse = menu.some(p => p.category === cat);
                    const isDefault = ['Cafetería', 'Pastelería', 'Comida', 'Bebidas'].includes(cat);
                    return (
                      <div key={cat} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{cat}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {inUse && (
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>En uso</span>
                          )}
                          {!isDefault && !inUse ? (
                            <button
                              type="button"
                              onClick={() => deleteCategoria(cat)}
                              className="btn btn-danger btn-icon-only"
                              style={{ padding: '6px', backgroundColor: 'transparent', borderColor: 'var(--danger-rust)', color: 'var(--danger-rust)' }}
                              title="Eliminar Categoría"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {isDefault ? 'Fijo' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowCategoryModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
