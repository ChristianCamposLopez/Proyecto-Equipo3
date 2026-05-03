# 🍽️ Sistema de Pedidos para Restaurantes

## 📌 Equipo No. 3

**Integrantes:**
- Ivan Eleuterio
- Mario Ramirez
- Irving Zurita
- Christian Campos
- Fray Fabian

---

## 📖 Descripción del Proyecto

Sistema web para la gestión de pedidos en restaurantes que permite:

- Gestión de usuarios y roles
- Administración de restaurantes y horarios
- Gestión de catálogo y menú
- Creación y seguimiento de pedidos
- Gestión de pagos digitales

El proyecto está desarrollado bajo metodología **Scrum** y actualmente se encuentra en el **Sprint 3**.

---
## Arquitectura MVC del proyecto 
```txt
sistema-restaurante-eq3/
│
├── app/                         <-- VISTAS Y RUTAS (Capa de Presentación)
│   ├── api/                     <-- Endpoints: El puente hacia los Controladores
│   │   ├── platos/route.ts      # Recibe peticiones GET/POST de platos
│   │   └── pedidos/route.ts     # Recibe peticiones de los pedidos
│   │
│   ├── catalogo/                
│   │   └── page.tsx             # Vista: Pantalla de filtrado (US001 - Ivan)
│   ├── carrito/                 
│   │   └── page.tsx             # Vista: Interfaz del carrito (US002 - Fray)
│   ├── pago/
│   │   └── page.tsx             # Vista: Pasarela de pagos (US003 - Christian)
│   ├── dashboard/               
│   │   └── page.tsx             # Vista: KDS de Cocina (US004 - Irving)
│   ├── admin/                   
│   │   └── page.tsx             # Vista: Gestión del menú (US005 - Mario)
│   │
│   ├── globals.css              # Estilos globales (Tailwind CSS)
│   └── layout.tsx               # Estructura principal (Navbar, Footer, etc.)
│
├── bd/                          <-- INICIALIZACIÓN DE LA BASE DE DATOS
│   └── init.sql                 # Sus scripts SQL del Sprint 2 para Postgres
│
├── config/                      <-- CONFIGURACIONES DEL SISTEMA
│   ├── index.ts                 # Archivo barril (exports)
│   └── db.ts                    # Conexión principal a PostgreSQL usando Pool
│
├── controllers/                 <-- CONTROLADORES (Lógica de Negocio)
│   ├── index.ts                 # Archivo barril
│   ├── CatalogoController.ts    # Clase que procesa el filtrado de categorías
│   ├── PedidoController.ts      # Clase que procesa el carrito y estados en cocina
│   ├── PagoController.ts        # Clase que valida y aprueba transacciones
│   └── MenuController.ts        # Clase que actualiza precios y stock
│
├── models/                      <-- MODELOS (Capa de Persistencia e Información)
│   ├── daos/                    # Data Access Objects (Consultas SQL)
│   │   ├── index.ts
│   │   ├── PlatoDAO.ts          # SELECT * FROM platos WHERE categoria_id = ?
│   │   ├── PedidoDAO.ts         # UPDATE pedidos SET estado = 'Preparing'
│   │   └── PagoDAO.ts           # INSERT INTO transacciones...
│   │
│   └── entities/                # Entidades (Tipado fuerte y Estructura de Objetos)
│       ├── index.ts
│       ├── Plato.ts             # Clase Plato { id, nombre, precio, stock }
│       ├── Categoria.ts         # Clase Categoria { id, nombre }
│       ├── Pedido.ts            # Clase Pedido { id, estado, total, fecha }
│       └── Transaccion.ts       # Clase Transaccion { id, monto, estado }
│
├── public/                      <-- ARCHIVOS ESTÁTICOS
│   └── imagenes/                # Fotos de hamburguesas, postres, etc.
│
├── docker-compose.yml           <-- Orquestador para levantar Next.js y Postgres
├── Dockerfile                   <-- Receta para construir la aplicación Node.js
├── next.config.ts               # Configuración de Next.js
├── package.json                 # Dependencias (pg, next, react, etc.)
└── tsconfig.json                # Configuración estricta de TypeScript
```

---

## 🚀 Análisis del Sistema y Stack Tecnológico

### 🛠️ Tecnologías Core
- **Framework:** Next.js (App Router) con TypeScript.
- **Base de Datos:** PostgreSQL (usando el driver `pg` directamente para máxima eficiencia).
- **Estilos:** Tailwind CSS 4.
- **Generación de Reportes:** `exceljs` (Excel) y `jspdf` / `jspdf-autotable` (PDF).
- **Contenerización:** Docker y Docker Compose para despliegue consistente.
- **Testing:** Jest y React Testing Library.

### 🏗️ Arquitectura MVC / Layered
El proyecto implementa una separación clara de responsabilidades:

1.  **Vistas y Rutas (`app/`):** Capa de presentación utilizando React Server Components y Client Components.
2.  **Controladores (`controllers/`):** Mediadores que contienen la lógica de orquestación.
3.  **Servicios (`services/`):** Lógica de negocio compleja (ej. Autenticación).
4.  **DAOs (`models/daos/`):** Capa de persistencia que maneja consultas SQL directas.
5.  **Entidades (`models/entities/`):** Definición de tipos y estructuras de datos del dominio.


## 🏗️ Arquitectura de Base de Datos

El sistema está compuesto por los siguientes módulos:

### 🔐 Seguridad
- users
- roles
- user_roles

### 🏪 Restaurantes
- restaurants
- restaurant_hours

### 📋 Catálogo y Menú
- categories
- products
- option_groups
- options
- product_option_groups

### 🛒 Pedidos
- orders
- order_items
- order_item_options

### 💳 Pagos
- payments

---

## 🗄️ Base de Datos

Motor: PostgreSQL  
Archivo SQL:  


### correr
```bash
# Solo la BD en Docker
docker-compose up db -d

# App local
npm run dev

# O todo junto en Docker
docker-compose up --build
```

docker exec -it proyecto-equipo3-web-1 node scripts/sync_db.js
