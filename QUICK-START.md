# 🚀 Quick Start - US009 Gestión de Imágenes

**TL;DR:** Ejecuta esto en orden:

```bash
# 1. Inicia la BD en Docker (Terminal 1)
cd ~/Documentos/Torres_sprint_3/Proyecto-Equipo3-main
docker-compose down && docker-compose up

# 2. Instala dependencias (Terminal 2)
npm install

# 3. Ejecuta todas las pruebas
bash scripts/run-all-tests.sh

# 4. Inicia servidor (Terminal 2)
npm run dev

# 5. Prueba en navegador
# Cliente: http://localhost:3000/catalogo
# Admin:   http://localhost:3000/admin/gestion-platos
```

---

## 📌 Comandos Principales

```bash
# Pruebas unitarias (sin BD)
npm run test:unit

# Pruebas integración (requiere BD corriendo)
npm run test:integration

# Pruebas SQL directo (requiere psql)
npm run test:black-box

# Pruebas API (requiere servidor corriendo)
node scripts/test-black-box-api.js

# Ver cobertura
npm test -- --coverage

# Modo watch (re-ejecuta al cambiar código)
npm test -- --watch
```

---

## 📱 Accesos

```
Cliente (Visualizar):
  http://localhost:3000/catalogo

Admin (Subir/Eliminar):
  http://localhost:3000/admin/gestion-platos

API Endpoints:
  GET    /api/platos                     # Listar productos
  POST   /api/platos/:id/images          # Subir imagen
  DELETE /api/platos/images/:imageId     # Eliminar imagen
```

---

## 💾 BD

```sql
-- Tabla principal
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  image_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  format VARCHAR(10),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL -- soft delete
);
```

---

## 📁 Archivos Nuevos

```
lib/
  ├─ image-validator.ts       # Validar formato, tamaño, dimensiones
  ├─ image-repository.ts      # CRUD en BD
  └─ image-storage.ts         # Guardar/eliminar archivos

app/api/platos/
  ├─ route.ts                 # GET /api/platos
  ├─ [id]/images/route.ts     # POST subir imagen
  └─ images/[imageId]/route.ts # DELETE eliminar

app/
  ├─ catalogo/page.tsx        # Cliente: listado
  └─ admin/gestion-platos/page.tsx # Admin: upload/delete

tests/
  ├─ unit/image-validator.test.ts     # Unitarias (8 tests)
  └─ integration/database.test.ts     # Integración (10 tests)

scripts/
  ├─ test-black-box-us009.sh   # Pruebas SQL (6 tests)
  ├─ test-black-box-api.js     # Pruebas API (2 tests)
  └─ run-all-tests.sh          # Ejecuta todo

Docs:
  ├─ TESTING.md                 # Guía completa
  └─ US009-IMPLEMENTACION.md    # Este proyecto
```

---

## ⚡ Flujos Rápidos

### Como Cliente (Visualizar)

1. Navega a `/catalogo`
2. Ve platillos con imágenes
3. Si no hay imagen, ve placeholder por defecto

### Como Admin (Subir)

1. Navega a `/admin/gestion-platos`
2. Selecciona platillo
3. Selecciona archivo (jpg, png, webp)
4. Click "Subir imagen"
5. Imagen guardada y marcada como primaria

### Como Admin (Eliminar)

1. En `/admin/gestion-platos`
2. Click botón de eliminar (basura)
3. Confirma
4. Imagen marcada como eliminada (soft delete)

---

## 🧪 Validaciones

✅ Formatos: JPG, PNG, WEBP  
✅ Tamaño máx: 2MB  
✅ Dimensiones mín: 500x500 px  
✅ Una primaria por platillo  
✅ Confirmación antes de eliminar  
✅ Cascade delete (BD)  

---

## 🆘 Si Algo Falla

```bash
# Recrea BD
docker-compose down
docker-compose up --build

# Reinstala deps
rm -rf node_modules package-lock.json
npm install

# Limpia datos de prueba
npm run test:integration  # auto-limpia

# Ver logs del servidor
npm run dev  # CTRL+C para parar

# Ver logs de BD
docker-compose logs db
```

---

## 📞 Más Info

Ver [TESTING.md](./TESTING.md) para:
- Instalación completa de dependencias
- Solución de problemas
- Requisitos del sistema
- Ejemplos detallados

---

**Ready?** 🚀 `npm run dev`

