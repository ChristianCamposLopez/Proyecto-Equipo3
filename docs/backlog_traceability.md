# Matriz de Trazabilidad y Cumplimiento de Requerimientos

Este documento detalla el estado de cada Historia de Usuario y sus sub-tareas en las tres capas de la arquitectura (Persistencia, Servicios y Presentación).

## 📊 Gestión de Menú

| ID | Descripción (Requerimiento) | Tareas Técnicas | P | S | UI | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **US005.1** | Crear nuevo plato (nombre, desc, precio, img, stock). | Diseñar tabla, implementar endpoint y método create(). | ✅ | ✅ | ✅ | **Completado** |
| **US005.2** | Modificar información de plato existente. | Implementar update(), validar existencia, probar actualización. | ✅ | ✅ | ✅ | **Completado** |
| **US005.3** | Eliminar plato (baja lógica). | Implementar eliminación lógica, actualizar consulta catálogo. | ✅ | ✅ | ✅ | **Completado** |
| **US005.4** | Actualizar precio de plato (> 0). | Método para modificar precio, validación > 0. | ✅ | ✅ | ✅ | **Completado** |
| **US005.5** | Modificar stock disponible. | Implementar método para stock, validar no negativo. | ✅ | ✅ | ✅ | **Completado** |
| **US005.6** | Activar / desactivar plato temporalmente. | Campo activo en BD, método para cambiar estado. | ✅ | ✅ | ✅ | **Completado** |
| **US008** | Marcar plato como "agotado" (stock 0). | Toggle disponibilidad, reflejar en app inmediatamente. | ✅ | ✅ | ✅ | **Completado** |
| **US009.1** | Ver imágenes de los platillos. | Almacenamiento, mostrar imágenes optimizadas. | ✅ | ✅ | ✅ | **Completado** |
| **US009.2** | Subir imagen de platillo. | Carga de imagen, almacenamiento y guardado de ruta. | ✅ | ✅ | ✅ | **Completado** |
| **US009.3** | Eliminar imagen de platillo. | Borrado de archivo y actualización de ruta en BD. | ✅ | ✅ | ✅ | **Completado** |
| **US020.1** | Registrar horario de disponibilidad. | Alta de horarios por platillo (desayuno/almuerzo). | ✅ | ✅ | ✅ | **Completado** |
| **US020.2** | Editar horario de disponibilidad. | Modificación de horarios existentes. | ✅ | ✅ | ✅ | **Completado** |

## 📊 Gestión de Pedidos y Carrito

| ID | Descripción (Requerimiento) | Tareas Técnicas | P | S | UI | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **US004** | Dashboard chef para gestionar pedidos. | Lista pedidos tiempo real, cambio de estados. | ✅ | ✅ | ✅ | **Completado** |
| **US007** | Notas especiales en pedido (sin cebolla). | Campo nota (max 200), guardado en DB, mostrar cocina. | ✅ | ✅ | ✅ | **Completado** |
| **US010** | Asignación de repartidores a pedidos listos. | Endpoint de asignación, lógica de disponibilidad. | ✅ | ✅ | ✅ | **Completado** |
| **US011** | Ver cuando el restaurante acepta mi pedido. | Estados de pedido, notificación al cliente. | ✅ | ✅ | ✅ | **Completado** |
| **US013.1** | Ver pedidos pendientes (Personal Cocina). | Consulta filtrada, endpoint y método repositorio. | ✅ | ✅ | ✅ | **Completado** |
| **US013.2** | Cambiar estado a "En preparación". | Método actualizar estado, validación de flujo. | ✅ | ✅ | ✅ | **Completado** |
| **US001** | Como cliente, quiero filtrar platos por categorías. | Crear endpoint de categorías, UI de filtros, Lógica en frontend. | ✅ | ✅ | ✅ | **Completado** |
| **US002** | Como cliente, quiero un carrito virtual. | Modelo de carrito, agregar/quitar, persistencia (DB). | ✅ | ✅ | ✅ | **Completado** |
| **US014** | Como cliente, quiero ingresar mi dirección de entrega. | dar de alta direccion, Modificar, Guardar. | ✅ | ✅ | ✅ | **Completado** |
| **US025.1** | Registrar restaurante (RFC único). | Tabla restaurantes, endpoint, validación RFC. | ✅ | ✅ | ✅ | **Completado** |
| **US025.2** | Modificación de Datos (nombre, dir, contacto). | Implementar update(), formulario y validación Regex. | ✅ | ✅ | ✅ | **Completado** |
| **US025.3** | Subir logo / imagen del restaurante. | Carga de imagen, almacenamiento ruta logo. | ✅ | ✅ | ✅ | **Completado** |
| **US025.4** | Definir horario de atención. | Campos horario en BD, validación cierre > apertura. | ✅ | ✅ | ✅ | **Completado** |
| **US025.5** | Apertura/Cierre y Activación. | Campo boolean, Switch en Dashboard. | ✅ | ✅ | ✅ | **Completado** |
| **US025.6** | Baja (Inactivación lógica). | active=false, validar pedidos pendientes. | ✅ | ✅ | ✅ | **Completado** |
| **US025.7** | Consulta de Perfil (Resumen). | Implementar findById y mapeo a vista lectura. | ✅ | ✅ | ✅ | **Completado** |

## 📊 Reportes e Inteligencia

| ID | Descripción (Requerimiento) | Tareas Técnicas | P | S | UI | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **US006** | Reportes de ventas diarias. | Consultas agregadas, Dashboard básico. | ✅ | ✅ | ✅ | **Completado** |
| **US015** | Exportar información a Excel. | Generar archivo Excel, descarga desde browser. | ✅ | ✅ | ✅ | **Completado** |
| **US019.1** | Calcular ranking de platos más vendidos. | Cálculo automático por período. | ✅ | ✅ | ✅ | **Completado** |
| **US021.1** | Guardar historial de pedidos para recomendación. | Almacenamiento histórico por cliente. | ✅ | ✅ | ✅ | **Completado** |
| **US026** | Gestión de Reembolsos. | Flujo de aprobación, historial y estados financieros. | ✅ | ✅ | ✅ | **Completado** |
| **US027** | Seguridad y Control de Acceso. | Sesiones, roles (Admin/Cliente) y guardia de rutas. | ✅ | ✅ | ✅ | **Completado** |

---
*Última revisión: 2026-05-03. Este documento es la fuente de verdad para el cumplimiento del proyecto.*
