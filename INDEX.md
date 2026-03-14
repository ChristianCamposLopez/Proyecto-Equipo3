# 📑 Índice de Implementación US009

## 🎯 Propósito

Este archivo es tu **mapa de navegación** para entender, ejecutar y extender la implementación de US009 (Gestión de Imágenes de Platillos).

---

## 📌 Por Dónde Empezar

### Si tienes 5 minutos ⚡

👉 Lee: [QUICK-START.md](./QUICK-START.md)

Ejecuta:
```bash
docker-compose up  # Terminal 1
npm run dev        # Terminal 2
```

Abre navegador:
- Cliente: http://localhost:3000/catalogo
- Admin: http://localhost:3000/admin/gestion-platos

---

### Si tienes 30 minutos 📖

1. Lee: [QUICK-START.md](./QUICK-START.md) (5 min)
2. Lee: [TESTING.md](./TESTING.md) - Secciones "Ejecutar Pruebas" (15 min)
3. Ejecuta: `npm run test:unit` (5 min)
4. Ejecuta: `bash scripts/run-all-tests.sh` (5 min)

---

### Si tienes 90 minutos 📚

1. Lee: [QUICK-START.md](./QUICK-START.md)
2. Lee: [US009-IMPLEMENTACION.md](./US009-IMPLEMENTACION.md) - Secciones clave
3. Lee: [TESTING.md](./TESTING.md) - Completo
4. Ejecuta todos los tests
5. Explora el código en `lib/` y `app/api/`

---

## 🏗️ Estructura del Proyecto

```
proyecto/
│
├── 📖 DOCUMENTACIÓN
│   ├─ QUICK-START.md              ← Empieza aquí (5 min)
│   ├─ US009-IMPLEMENTACION.md     ← Visión completa (90 min)
│   ├─ TESTING.md                  ← Guía de pruebas (30 min)
│   └─ README.md                   ← Proyecto original
│
├── 💻 CÓDIGO FUENTE
│   ├─ lib/
│   │  ├─ image-validator.ts       ← Validación (formatos, tamaño)
│   │  ├─ image-repository.ts      ← CRUD en BD
│   │  └─ image-storage.ts         ← Almacenamiento de archivos
│   │
│   ├─ app/api/
│   │  └─ platos/
│   │     ├─ route.ts              ← GET /api/platos
│   │     ├─ [id]/images/route.ts  ← POST /api/platos/:id/images
│   │     └─ images/[imageId]/route.ts ← DELETE /api/platos/images/:id
│   │
│   ├─ app/
│   │  ├─ catalogo/page.tsx        ← Cliente: visualizar
│   │  └─ admin/gestion-platos/page.tsx ← Admin: subir/eliminar
│   │
│   └─ config/
│      └─ db.ts                    ← Conexión a PostgreSQL
│
├── 🧪 PRUEBAS
│   ├─ tests/unit/
│   │  └─ image-validator.test.ts  ← 8 pruebas unitarias
│   │
│   └─ tests/integration/
│      └─ database.test.ts         ← 10 pruebas de integración
│
├── 📜 SCRIPTS
│   ├─ scripts/
│   │  ├─ run-all-tests.sh         ← Ejecuta todo
│   │  ├─ test-black-box-us009.sh  ← Pruebas SQL directo
│   │  └─ test-black-box-api.js    ← Pruebas HTTP
│   │
│   └─ Logs y salida en consola
│
├── 💾 BASE DE DATOS
│   ├─ bd/init.sql                 ← Tabla product_images
│   │
│   └─ Tabla: product_images
│      ├─ id, product_id (FK)
│      ├─ image_path, file_name, file_size, format
│      ├─ is_primary (BOOLEAN)
│      └─ created_at, updated_at, deleted_at (soft delete)
│
└── 📁 ALMACENAMIENTO
   └─ public/uploads/              ← Imágenes guardadas aquí
      ├─ 1708789234-hamburguesa.jpg
      ├─ 1708789245-pizza.png
      └─ ...
```

---

## 🎓 Aprendizaje por Niveles

### Nivel 1: Usuario Final 👤

**Objetivo:** Usar la aplicación sin tocar código

1. Abre: http://localhost:3000/catalogo
2. Ve los platillos con imágenes
3. Como admin: entra a /admin/gestion-platos
4. Sube y elimina imágenes

**Documentación:** [QUICK-START.md](./QUICK-START.md#cómo-empezar)

---

### Nivel 2: Tester 🧪

**Objetivo:** Ejecutar y entender las pruebas

1. Lee: [TESTING.md](./TESTING.md) - Sección "Ejecutar Pruebas"
2. Ejecuta:
   - `npm run test:unit` (validador)
   - `npm run test:integration` (BD)
   - `npm run test:black-box` (SQL)
3. Observa resultados
4. Modifica y re-ejecuta

**Comandos clave:**
```bash
npm test                    # todas
npm run test:unit          # sólo unitarias
npm run test:integration   # sólo integración
npm run test:black-box     # sólo SQL
npm test -- --watch        # modo watch
npm test -- --coverage     # cobertura
```

---

### Nivel 3: Desarrollador 🔧

**Objetivo:** Entender e implementar cambios

1. Lee: [US009-IMPLEMENTACION.md](./US009-IMPLEMENTACION.md)
   - Secciones: "Flujos", "Validaciones", "Archivos Creados"

2. Explora el código:
   - `lib/image-validator.ts` - Lógica de validación
   - `lib/image-repository.ts` - BD queries
   - `app/api/platos/[id]/images/route.ts` - API POST

3. Modifica y prueba:
   ```bash
   npm run dev  # Servidor
   npm test -- --watch  # Tests en paralelo
   ```

4. Agrega nuevos tests:
   - Copia patrón de `tests/unit/image-validator.test.ts`
   - Ejecuta: `npm test -- --watch`

---

### Nivel 4: Arquitecto 🏗️

**Objetivo:** Entender diseño y mejorar

1. Lee: [US009-IMPLEMENTACION.md](./US009-IMPLEMENTACION.md) - Completo

2. Revisa diagramas de secuencia:
   - [US009_1_Secuencia.puml](../Ivan/Sprint3/US009/US009_1_Secuencia.puml)
   - [US009_2_Secuencia.puml](../Ivan/Sprint3/US009/US009_2_Secuencia.puml)
   - [US009_3_Secuencia.puml](../Ivan/Sprint3/US009/US009_3_Secuencia.puml)

3. Revisa diagrama de clases:
   - [US009_Clases.puml](../Ivan/Sprint3/US009/US009_Clases.puml)

4. Propone mejoras:
   - Agregar watermarking a imágenes
   - Cache de imágenes (Redis)
   - CDN para distribución
   - Optimización con sharp/imagemin

---

## 🚀 Ejecución Rápida

### Setup Inicial (Primera vez)

```bash
# Clona y entra
cd ~/Documentos/Torres_sprint_3/Proyecto-Equipo3-main

# Instala dependencias
npm install

# Inicia BD
docker-compose up

# (En otra terminal) Ejecuta pruebas
bash scripts/run-all-tests.sh

# Inicia servidor
npm run dev

# Abre navegador
echo "http://localhost:3000/catalogo"  # Cliente
echo "http://localhost:3000/admin/gestion-platos"  # Admin
```

### Desarrollo Diario

```bash
# Terminal 1: BD
docker-compose up

# Terminal 2: Servidor
npm run dev

# Terminal 3: Tests (modo watch)
npm test -- --watch

# Terminal 4: Edita código en lib/ y app/
# El servidor se recarga automáticamente
# Los tests se re-ejecutan al guardar
```

---

## 📊 Desglose de Tareas

### ✅ COMPLETADAS

- [x] Tabla `product_images` en BD
- [x] ImageValidator (validaciones)
- [x] ImageRepository (CRUD)
- [x] ImageStorageService (archivos)
- [x] API GET /api/platos
- [x] API POST /api/platos/:id/images
- [x] API DELETE /api/platos/images/:imageId
- [x] Frontend catalogo/page.tsx
- [x] Frontend admin/gestion-platos/page.tsx
- [x] 8 pruebas unitarias
- [x] 10 pruebas integración
- [x] 6 pruebas SQL directo
- [x] 2 pruebas API
- [x] Documentación completa
- [x] Scripts automatizados

### 🚀 POSIBLES MEJORAS (Futuro)

- [ ] Procesamiento de imágenes (sharp)
- [ ] Caché de imágenes (Redis)
- [ ] CDN (Cloudinary, AWS S3)
- [ ] Watermarking automático
- [ ] Compresión WebP
- [ ] Galería de múltiples imágenes
- [ ] Reordenar imágenes (drag-drop)
- [ ] Estadísticas de visualización

---

## 🔗 Navegación Rápida

| Necesito... | Lee esto |
|------------|----------|
| Empezar rápido | [QUICK-START.md](./QUICK-START.md) |
| Entender pruebas | [TESTING.md](./TESTING.md) |
| Detalles completos | [US009-IMPLEMENTACION.md](./US009-IMPLEMENTACION.md) |
| Código API | [app/api/platos/](./app/api/platos/) |
| Código lógica | [lib/](./lib/) |
| Tests | [tests/](./tests/) |
| Scripts | [scripts/](./scripts/) |

---

## ❓ FAQ Rápido

**P: ¿Por dónde empiezo?**
R: [QUICK-START.md](./QUICK-START.md) (5 minutos)

**P: ¿Cómo ejecuto las pruebas?**
R: `npm run test:unit` o `bash scripts/run-all-tests.sh`

**P: ¿Dónde se guardan las imágenes?**
R: `public/uploads/` (accesible en `/uploads/:filename`)

**P: ¿Qué formatos aceptan?**
R: JPG, JPEG, PNG, WebP (máx 2MB, 500x500px mín)

**P: ¿Se borran realmente las imágenes?**
R: Soft delete (se marcan como eliminadas pero se pueden recuperar)

**P: ¿Puedo agregar más validaciones?**
R: Sí, modifica `lib/image-validator.ts` y añade tests

**P: ¿Cómo integro con otra BD?**
R: Modifica queries en `lib/image-repository.ts`

---

## 📞 Soporte

Si algo no funciona:

1. **Primera vez?** → Ve a [QUICK-START.md](./QUICK-START.md) y sigue paso a paso
2. **Tests fallan?** → Ve a [TESTING.md](./TESTING.md) sección "Solución de Problemas"
3. **Código confuso?** → Ve a [US009-IMPLEMENTACION.md](./US009-IMPLEMENTACION.md) - busca la sección relevante
4. **Error específico?** → Busca el error en console/logs del servidor

---

## 🎯 Próximos Pasos

1. **Ejecuta** `npm run dev` y prueba en navegador
2. **Corre** todas las pruebas: `bash scripts/run-all-tests.sh`
3. **Lee** [TESTING.md](./TESTING.md) si quieres entender pruebas
4. **Modifica** código en `lib/` o `app/` y ve cambios en tiempo real
5. **Extiende** con pruebas nuevas o nuevas funcionalidades

---

**Última actualización:** 27 de febrero de 2026  
**Estado:** ✅ Listo para usar y extender
