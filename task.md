# Lista de Tareas (facturador_ristretto)

- [x] **Fase 1: Configuración Inicial y Estructura**
  - [x] Inicializar el proyecto con Vite (`react` template) en `./`
  - [x] Instalar dependencias necesarias (lucide-react para íconos elegantes)
  - [x] Crear el sistema de diseño en `index.css` (variables de color del logo, fuentes Montserrat/Outfit, grilla de fondo del logo)
  - [x] Crear la barra de navegación lateral y estructura básica de la app

- [x] **Fase 2: Estado Global (Context/State) y LocalStorage**
  - [x] Crear `RistrettoContext.jsx` para gestionar el menú, ventas, gastos, estado de caja activa e historial de arqueos
  - [x] Implementar la persistencia offline-first automática en `localStorage`
  - [x] Cargar productos iniciales por defecto (cafés clásicos, filtrados, pastelería) para pruebas iniciales

- [x] **Fase 3: Vista de Gestión del Menú**
  - [x] Diseñar el listado visual del menú de productos con categorías, precios y stock
  - [x] Crear el modal/formulario para Agregar, Editar y Eliminar productos del menú
  - [x] Implementar la lógica de alertas visuales de stock bajo

- [x] **Fase 4: Punto de Venta (POS) y Carrito**
  - [x] Diseñar la interfaz del POS (grilla de productos filtrable por categoría + buscador reactivo)
  - [x] Implementar la lógica del carrito (añadir, modificar cantidad, remover, notas al ítem, descuento global)
  - [x] Crear la simulación de cobro (selección de método de pago: efectivo, tarjeta, transferencia)
  - [x] Diseñar el formato de Ticket Térmico (impresión física) y estilos CSS `@media print` para emular ticket de 58mm/80mm

- [x] **Fase 9: Sincronización Multi-dispositivo, Roles e Impresión de Comandas**
  - [x] Configurar Firebase SDK y Firestore (Offline-first / Multi-tab)
  - [x] Migrar persistencia de LocalStorage a Firebase Firestore en tiempo real
  - [x] Implementar Roles de Acceso (Admin y Mozo) en Login y Sidebar
  - [x] Mantener menú y pedidos para el rol Mozo (ocultando panel financiero, gastos y arqueo de caja)
  - [x] Agregar botón "Imprimir Comanda de Cocina" en POS (pedidos de mesas)
  - [x] Diseñar el formato de Ticket Térmico (impresión física) y estilos CSS `@media print` para emular ticket de 58mm/80mm

- [x] **Fase 5: Control de Gastos**
  - [x] Diseñar el panel de registro de gastos diarios/mensuales
  - [x] Crear el formulario de nuevo gasto (monto, categoría, descripción, fecha)
  - [x] Listar egresos con filtros por fecha y categoría

- [x] **Fase 6: Control de Caja y Arqueo**
  - [x] Implementar flujo de Apertura de Caja (monto inicial en efectivo)
  - [x] Implementar registro de Movimientos de Caja manuales (ingresos/egresos de efectivo extraordinarios)
  - [x] Implementar el Arqueo de Cierre de Caja (cálculo de ventas en efectivo + egresos contra dinero real contado en caja)
  - [x] Guardar historial de arqueos cerrados y mostrar reportes históricos

- [x] **Fase 7: Dashboard y Reportes Visuales**
  - [x] Diseñar la pantalla principal con estadísticas del día (Ventas totales, Ganancia neta, Gastos, Caja actual)
  - [x] Crear gráficos sencillos usando CSS/SVG o librerías ligeras para visualizar tendencias
  - [x] Implementar botón de exportar/importar backup en JSON (resiliencia y copias de seguridad offline)

- [x] **Fase 8: Pulido Visual y Verificación**
  - [x] Añadir micro-animaciones (efecto de agregado a carrito, carga de transiciones)
  - [x] Probar la app en modo responsive (móvil, tablet, escritorio)
  - [x] Correr builds de producción para validar código libre de errores

- [/] **Fase 10: Dashboard Financiero Profesional y Filtros Históricos**
  - [ ] Agregar filtros por rango de fechas (Hoy, Ayer, 7 días, 30 días, Mes, Historial, Personalizado)
  - [ ] Implementar métricas financieras (Facturación, Costos, Margen Bruto, Gastos, Utilidad Neta del Local, Ticket Promedio)
  - [ ] Agregar pestañas de navegación (Resumen, Historial de Ventas, Historial de Gastos)
  - [ ] Crear buscadores y modales para expandir los detalles de ventas y gastos históricos
