# Skill: Restaurant System MVC (Proyecto-Equipo3)

Bitácora y documentación técnica del sistema de restaurante para proporcionar contexto y facilitar el desarrollo futuro.

## 📋 Resumen del Proyecto
Sistema de gestión de restaurante con una arquitectura robusta basada en el patrón Modelo-Vista-Controlador (MVC), utilizando Next.js 16 para el frontend y backend (API Routes).

## 🐳 Despliegue con Docker
El sistema está completamente dockerizado. Para iniciar el entorno de desarrollo:

1. **Levantar el sistema**:
   ```bash
   docker-compose up --build
   ```
2. **Acceso**:
   - **Frontend/Backend**: [http://localhost:3000](http://localhost:3000)
   - **Base de Datos**: PostgreSQL en el puerto `5432` del host (si se requiere acceso externo).

El `docker-compose.yml` gestiona dos servicios:
- `web`: Aplicación Next.js.
- `db`: Base de Datos PostgreSQL 15 con persistencia en el volumen `pg_data` e inicialización automática vía `./bd/init.sql`.

## 🏗️ Arquitectura MVC

### 1. Capa de Modelos (Persistencia - `models/`)
- **Entities**: Lógica de dominio y definiciones de datos.
- **DAOs**: Acceso directo a PostgreSQL mediante SQL.

### 2. Capa de Servicios (Lógica de Negocio - `services/`)
Contiene la inteligencia del sistema: validaciones, cifrado (bcrypt), gestión de tokens (JWT) y procesos de negocio complejos.

### 3. Capa de Controladores (Coordinación - `controllers/`)
Mediadores que reciben peticiones de la API de Next.js y orquestan la llamada a los servicios correspondientes.

### 4. Capa de Presentación (Vistas - `app/`)
Interfaz de usuario construida con Next.js App Router.
- **Isla de Navegación (`app/page.tsx`)**: Menú central.
- **Componentes (`app/_components/`)**: Elementos UI organizados internamente para evitar rutas automáticas.
- **Hooks (`hooks/`)**: Gestión de estado y consumo de API.

## 🛠️ Módulos Implementados y Rutas API

### 🔐 Autenticación y Acceso (`app/api/auth`)
- `POST /api/auth/register`: Registro de nuevos administradores.
- `POST /api/auth/login`: Inicio de sesión y generación de JWT.
- `POST /api/auth/recovery`: Solicitud de recuperación de cuenta.

### 📊 Reportes (`app/api/reports`)
- `GET /api/api/reports/daily-sales`: Obtener datos de ventas diarias.
- `GET /api/api/reports/daily-sales/csv`: Descargar reporte en formato CSV.

### 📋 Menú y Productos (`app/api/menu` / `app/api/products`)
- `GET /api/menu/categories`: Listar categorías del menú.
- `GET /api/menu/products`: Listar productos.
- `GET /api/products/[id]/image`: Obtener imagen de un producto específico.

### 🛒 Pedidos (`app/api/orders`)
- `POST /api/orders`: Crear un nuevo pedido.
- `POST /api/orders/cancel`: Cancelar un pedido existente.

## 🛠️ Reglas de Refactorización y Estándares

Para mantener la integridad de la arquitectura de 3 capas, se deben seguir estas reglas:

### 1. Capa de Persistencia (`models/daos` y `models/entities`)
- **DAOs Estáticos**: Todos los DAOs deben usar clases con métodos estáticos (`static async`). No se deben instanciar DAOs en los servicios o controladores.
- **Tipado Fuerte**: Evitar el uso de `any`. Todos los métodos de los DAOs deben retornar interfaces o clases definidas en `models/entities`.
- **Centralización**: Utilizar los archivos `index.ts` (barril) en `daos/` y `entities/` para facilitar las importaciones.
- **Alias de Importación**: Usar siempre `@/models/daos` y `@/models/entities`.

### 2. Trazabilidad de Historias de Usuario (CRÍTICO)
- **No eliminar comentarios de US**: Los comentarios que referencian Historias de Usuario (ej. `US001`, `US020.1`) son obligatorios para la trazabilidad con el Backlog.
- **Documentación Concisa**: Preferir código autodocumentado con comentarios de una sola oración explicativa.

### 3. Integración de Capas
- **Flujo de Datos**: `API Route` -> `Controller/Service` -> `DAO` -> `Database`.
- **Validaciones**: La lógica de validación de negocio reside en los `Services`, no en los `DAOs`.

## 📌 Mapeo de Historias de Usuario Clave
- **US005 (CRUD Platos)**: Gestionado por `ProductoDAO`.
- **US019 (Ranking)**: Gestionado por `RankingDAO`.
- **US020 (Disponibilidad)**: Gestionado por `DisponibilidadDAO` y `ProductAvailabilityDAO`.
- **US021 (Recomendaciones)**: Gestionado por `RecomendacionDAO`.
- **US026 (Reembolsos)**: Gestionado por `ReembolsoDAO`.

## 📂 Estructura de Directorios Clave
- `/app`: Vistas y API Routes.
- `/controllers`: Controladores MVC.
- `/services`: Servicios de lógica de negocio.
- `/models`: Entidades y DAOs.
- `/config`: Configuración de DB, JWT y Multer.
- `/bd`: Scripts SQL de inicialización.
