# Test Suite para US009 - Gestión de Imágenes de Platillos

Este documento describe cómo ejecutar las pruebas unitarias, de integración y de caja negra para la historia de usuario US009.

## Estructura de Pruebas

```
tests/
├── unit/
│   └── image-validator.test.ts       # Pruebas unitarias del validador
└── integration/
    └── database.test.ts              # Pruebas de integración con BD
scripts/
├── test-black-box-us009.sh           # Pruebas SQL directo (caja negra)
├── test-black-box-api.js             # Pruebas de API (caja negra)
└── run-all-tests.sh                  # Script para ejecutar todas las pruebas
```

## Requisitos

1. **Node.js 18+** - instala desde [nodejs.org](https://nodejs.org)
2. **PostgreSQL corriendo** - verifica con `docker-compose up`:
   ```bash
   cd /home/ivan/Documentos/Torres_sprint_3/Proyecto-Equipo3-main
   docker-compose up
   ```
3. **Dependencias instaladas**:
   ```bash
   npm install
   ```

## Configuración del Entorno

Las variables de entorno por defecto son:
```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password_secreto
DB_NAME=restaurante_bd
DB_PORT=5432
```

Si tu conf es diferente, ajusta `.env.local` o exporta antes de las pruebas:
```bash
export DB_HOST=tu_host
export DB_USER=tu_usuario
npm run test:integration
```

## Ejecutar Pruebas

### 1) Todas las pruebas (recomendado)

```bash
bash scripts/run-all-tests.sh
```

O alternativamente:

```bash
npm test
```

### 2) Pruebas Unitarias (ImageValidator)

Valida el validador de formatos, tamaños y dimensiones **sin conectar a BD**.

```bash
npm run test:unit
```

**Qué prueba:**
- Validación de formatos (jpg, png, webp, etc.)
- Validación de tamaño (máx 2MB)
- Rechazo de archivos inválidos

**Ejemplo de salida:**
```
 PASS  tests/unit/image-validator.test.ts
  ImageValidator
    validateFormat
      ✓ should accept valid formats
      ✓ should reject invalid formats
    validateSize
      ✓ should accept files under 2MB
      ✓ should reject files over 2MB
      ✓ should reject zero-sized files

Tests:       5 passed, 5 total
```

### 3) Pruebas de Integración (BD)

Conecta a PostgreSQL y prueba el flujo completo CRUD.

```bash
npm run test:integration
```

**Qué prueba:**
- Crear imagen válida (INSERT)
- Leer imágenes (SELECT)
- Eliminar imagen con soft delete (UPDATE deleted_at)
- Marcar como primaria (is_primary flag)
- Cascade delete (ON DELETE CASCADE)

**Requisitos:**
- PostgreSQL corriendo
- Tabla `product_images` creada (`docker-compose up` la crea automáticamente)

**Ejemplo de salida:**
```
 PASS  tests/integration/database.test.ts (3.2 s)
  ImageRepository - BD Integration (US009)
    US009.1 - Leer imágenes de producto
      ✓ debería devolver lista vacía para producto sin imágenes
      ✓ debería devolver imagen primaria después de guardar
    US009.2 - Subir imagen (crear)
      ✓ debería insertar imagen válida
      ✓ debería marcar otra imagen como no primaria si nueva es primaria

Tests:       8 passed, 8 total
```

### 4) Pruebas de Caja Negra SQL

Ejecuta consultas SQL directo contra PostgreSQL (requiere `psql`).

```bash
npm run test:black-box
```

O si prefieres el script bash directo:
```bash
bash scripts/test-black-box-us009.sh
```

**Qué prueba:**
- Lectura de productos con imágenes (LEFT JOIN)
- Inserción de imagen válida
- Verificación de is_primary única
- Soft delete (marcar deleted_at)
- Hard delete (DELETE)

**Requisitos:**
- PostgreSQL corriendo
- Cliente `psql` instalado:
  - **Ubuntu**: `sudo apt-get install postgresql-client`
  - **macOS**: `brew install postgresql`
  - **Windows**: instala [PostgreSQL](https://www.postgresql.org/download/windows/)

### 5) Pruebas de Caja Negra API

Prueba los endpoints HTTP del servidor Next.js.

```bash
# Asegúrate de que el servidor está corriendo
npm run dev  # en otra terminal

# En otra terminal, ejecuta:
node scripts/test-black-box-api.js
```

**Qué prueba:**
- GET /api/platos → lista de productos
- POST /api/platos/:id/images → subir imagen (validacion)
- DELETE /api/platos/images/:id → eliminar imagen

## Ejemplos Prácticos

### Flujo Completo de Prueba

```bash
# Terminal 1: Inicia la BD
cd /home/ivan/Documentos/Torres_sprint_3/Proyecto-Equipo3-main
docker-compose up

# Terminal 2: Instala deps y ejecuta pruebas unitarias
npm install
npm run test:unit

# Terminal 3: Ejecuta pruebas de integración
npm run test:integration

# Terminal 4: Pruebas de SQL directo
bash scripts/test-black-box-us009.sh

# Terminal 5: Inicia servidor y prueba API
npm run dev
node scripts/test-black-box-api.js
```

### Ver Cobertura de Pruebas

```bash
npm test -- --coverage
```

## Solución de Problemas

### Error: "Cannot find module 'pg'"

```bash
npm install
```

### Error: "psql: command not found"

Instala PostgreSQL client:
```bash
# Ubuntu
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Descarga desde https://www.postgresql.org/download/windows/
```

### Error: "Connexion refused" en BD

Verifica que Docker está corriendo:
```bash
docker-compose ps
```

Si no está corriendo:
```bash
docker-compose up -d
```

### Error en pruebas de integración: "relation \"product_images\" does not exist"

Las tablas no se crearon. Recrea la BD:
```bash
docker-compose down
docker-compose up --build
```

## Monitoreo Continuo

Para re-ejecutar pruebas cuando cambias código:

```bash
npm test -- --watch
```

## Continua Integración (CI/CD)

Los scripts están diseñados para integrarse con sistemas CI. Ejemplo con GitHub Actions:

```yaml
name: US009 Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password_secreto
          POSTGRES_DB: restaurante_bd
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
```

## Referencias

- **US009.1_Secuencia.puml** - Flujo de visualización
- **US009.2_Secuencia.puml** - Flujo de subida
- **US009.3_Secuencia.puml** - Flujo de eliminación
- **US009_Clases.puml** - Arquitectura de clases
- **Cambios_base_datos.txt** - Esquema de `product_images`
- **pruebas.txt** - Casos de prueba SQL

## FAQ

**P: ¿Puedo ejecutar pruebas sin Docker?**

R: Sí, pero necesitas PostgreSQL instalado localmente. Ajusta `DB_HOST` en las variables de entorno.

**P: ¿Qué pasa si una prueba falla?**

R: Verifica el logs de error, la conexión a BD, y los datos de prueba. Los scripts incluyen cleanup automático.

**P: ¿Cómo agrego más pruebas?**

R: Crea archivos `.test.ts` bajo `tests/unit/` o `tests/integration/`. Jest los descubrirá automáticamente.

---

Última actualización: 27 de febrero de 2026
