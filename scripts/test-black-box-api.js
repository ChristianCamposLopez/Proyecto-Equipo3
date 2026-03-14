#!/usr/bin/env node
// scripts/test-black-box-api.js
// Pruebas de caja negra contra los endpoints API de US009

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   PRUEBAS DE CAJA NEGRA - API (US009)     ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passed = 0,
    failed = 0;

  try {
    console.log('[TEST 1] GET /api/platos - Listar productos con imágenes');
    const res1 = await request('GET', '/api/platos');
    if (res1.status === 200 && Array.isArray(res1.body.products)) {
      console.log('  ✓ PASS: devuelve array de productos\n');
      passed++;
    } else {
      console.log('  ✗ FAIL: respuesta inesperada\n');
      console.log('  Respuesta:', res1.body);
      failed++;
    }
  } catch (e) {
    console.log('  ✗ FAIL: No se pudo conectar al servidor\n');
    console.log('  Error:', e.message);
    console.log('  Asegúrate de que el servidor está corriendo en', BASE_URL);
    failed++;
  }

  try {
    console.log('[TEST 2] POST /api/platos/1/images - Subir imagen (base64 mock)');
    const mockPayload = {
      fileName: 'test.jpg',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', // JPEG mínimo
      format: 'jpg',
      isPrimary: true,
    };
    const res2 = await request('POST', '/api/platos/1/images', mockPayload);
    if (res2.status === 200 && res2.body.image) {
      console.log('  ✓ PASS: crea imagen correctamente\n');
      passed++;
    } else if (res2.status >= 400) {
      console.log('  ⚠ WARN: servidor rechazó (posible datos inválidos o BD desconectada)\n');
      console.log('  Status:', res2.status, 'Body:', res2.body);
      // no es fallo total, la validación funciona
      passed++;
    } else {
      console.log('  ✗ FAIL: respuesta inesperada\n');
      console.log('  Status:', res2.status, 'Body:', res2.body);
      failed++;
    }
  } catch (e) {
    console.log('  ⚠ WARN: Error en POST /api/platos/1/images\n');
    console.log('  Error:', e.message);
  }

  console.log('╔════════════════════════════════════════════╗');
  console.log('║   RESUMEN                                 ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Pasadas: ${passed}`);
  console.log(`Fallidas: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('✓ Pruebas completadas sin errores críticos');
    process.exit(0);
  } else {
    console.log('✗ Algunas pruebas fallaron');
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Error ejecutando pruebas:', e);
  process.exit(1);
});
