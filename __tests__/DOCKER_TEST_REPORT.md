PASS __tests__/us011-crear-orden.test.tsx
PASS __tests__/us015-us006-exportacion.test.tsx
PASS __tests__/timezone-dates.test.tsx
PASS __tests__/us012-historial-ordenes.test.tsx
PASS __tests__/US009.2-SubirImagen-Integral.test.ts
  ● Console

    console.error
      POST /api/platos/[id]/images error Error: Format not allowed
          at ImagenService.uploadImage (/app/services/ImagenService.ts:29:13)
          at POST (/app/app/api/platos/[id]/images/route.ts:46:43)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at Object.<anonymous> (/app/__tests__/US009.2-SubirImagen-Integral.test.ts:194:21)

      53 |     return NextResponse.json(result);
      54 |   } catch (err: any) {
    > 55 |     console.error('POST /api/platos/[id]/images error', err);
         |             ^
      56 |     const status = err.message.includes('not allowed') || err.message.includes('too large') ? 400 : 500;
      57 |     return NextResponse.json({ error: err.message || 'Internal server error' }, { status });
      58 |   }

      at POST (app/api/platos/[id]/images/route.ts:55:13)
      at Object.<anonymous> (__tests__/US009.2-SubirImagen-Integral.test.ts:194:21)

PASS __tests__/US020.1-RegistrarHorario-integral.test.ts (5.12 s)
  ● Console

    console.error
      Error: DB error
          at Object.<anonymous> (/app/__tests__/US020.1-RegistrarHorario-integral.test.ts:213:45)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      52 |     return NextResponse.json({ availability });
      53 |   } catch (err: any) {
    > 54 |     console.error(err);
         |             ^
      55 |     const status = err.message.includes('overlaps') || err.message.includes('must be') ? 400 : 500;
      56 |     return NextResponse.json({ error: err.message }, { status });
      57 |   }

      at POST (app/api/platos/[id]/availability/route.ts:54:13)
      at Object.<anonymous> (__tests__/US020.1-RegistrarHorario-integral.test.ts:216:21)

PASS __tests__/US009.3-EliminarImagen-Integral.test.ts
  ● Console

    console.warn
      File not found on disk: /uploads/missing.jpg

      81 |       await fs.unlink(filePath);
      82 |     } catch (err) {
    > 83 |       console.warn('File not found on disk:', image.image_path);
         |               ^
      84 |     }
      85 |
      86 |     // Eliminar registro

      at ImagenService.deleteImage (services/ImagenService.ts:83:15)
      at Object.<anonymous> (__tests__/US009.3-EliminarImagen-Integral.test.ts:134:9)

    console.error
      Error: Image not found
          at ImagenService.deleteImage (/app/services/ImagenService.ts:76:23)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at DELETE (/app/app/api/platos/[id]/images/[imageId]/route.ts:17:5)
          at Object.<anonymous> (/app/__tests__/US009.3-EliminarImagen-Integral.test.ts:175:21)

      18 |     return NextResponse.json({ message: 'Image deleted permanently' });
      19 |   } catch (err: any) {
    > 20 |     console.error(err);
         |             ^
      21 |     const status = err.message === 'Image not found' ? 404 : 500;
      22 |     return NextResponse.json({ error: err.message }, { status });
      23 |   }

      at DELETE (app/api/platos/[id]/images/[imageId]/route.ts:20:13)
      at Object.<anonymous> (__tests__/US009.3-EliminarImagen-Integral.test.ts:175:21)

    console.error
      Error: DB crash
          at Object.<anonymous> (/app/__tests__/US009.3-EliminarImagen-Integral.test.ts:183:42)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      18 |     return NextResponse.json({ message: 'Image deleted permanently' });
      19 |   } catch (err: any) {
    > 20 |     console.error(err);
         |             ^
      21 |     const status = err.message === 'Image not found' ? 404 : 500;
      22 |     return NextResponse.json({ error: err.message }, { status });
      23 |   }

      at DELETE (app/api/platos/[id]/images/[imageId]/route.ts:20:13)
      at Object.<anonymous> (__tests__/US009.3-EliminarImagen-Integral.test.ts:188:21)

PASS __tests__/US020.2-EditarHorario-integral.test.ts (5.411 s)
  ● Console

    console.error
      Error: Not found
          at DisponibilidadService.update (/app/services/DisponibilidadService.ts:48:26)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at PATCH (/app/app/api/platos/[id]/availability/[availabilityId]/route.ts:32:21)
          at Object.<anonymous> (/app/__tests__/US020.2-EditarHorario-integral.test.ts:172:21)

      35 |
      36 |   } catch (err: any) {
    > 37 |     console.error(err);
         |             ^
      38 |     
      39 |     // Determinación dinámica del status code
      40 |     let status = 500;

      at PATCH (app/api/platos/[id]/availability/[availabilityId]/route.ts:37:13)
      at Object.<anonymous> (__tests__/US020.2-EditarHorario-integral.test.ts:172:21)

    console.error
      Error: Schedule overlaps with existing one
          at DisponibilidadService.update (/app/services/DisponibilidadService.ts:58:24)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at PATCH (/app/app/api/platos/[id]/availability/[availabilityId]/route.ts:32:21)
          at Object.<anonymous> (/app/__tests__/US020.2-EditarHorario-integral.test.ts:182:21)

      35 |
      36 |   } catch (err: any) {
    > 37 |     console.error(err);
         |             ^
      38 |     
      39 |     // Determinación dinámica del status code
      40 |     let status = 500;

      at PATCH (app/api/platos/[id]/availability/[availabilityId]/route.ts:37:13)
      at Object.<anonymous> (__tests__/US020.2-EditarHorario-integral.test.ts:182:21)

PASS __tests__/US005.2-EditarPlato-Integral.test.ts (5.484 s)
  ● Console

    console.log
      >>> Probando US005: Edición de platos en el menú...

      at Object.<anonymous> (__tests__/US005.2-EditarPlato-Integral.test.ts:19:13)

    console.error
      Error: DB error
          at Object.<anonymous> (/app/__tests__/US005.2-EditarPlato-Integral.test.ts:179:47)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      23 |     return NextResponse.json({ message: 'Nombre actualizado', product: updated });
      24 |   } catch (err: any) {
    > 25 |     console.error(err);
         |             ^
      26 |     return NextResponse.json({ error: err.message }, { status: 500 });
      27 |   }
      28 | }

      at PATCH (app/api/platos/[id]/nombre/route.ts:25:13)
      at Object.<anonymous> (__tests__/US005.2-EditarPlato-Integral.test.ts:184:23)

PASS __tests__/US005.6-ActivarDesactivar-Integral.test.ts
  ● Console

    console.error
      Error: DB error
          at Object.<anonymous> (/app/__tests__/US005.6-ActivarDesactivar-Integral.test.ts:127:43)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      18 |     return NextResponse.json({ message: 'Producto activado exitosamente' });
      19 |   } catch (err: any) {
    > 20 |     console.error(err);
         |             ^
      21 |     return NextResponse.json({ error: err.message }, { status: 500 });
      22 |   }
      23 | }

      at PATCH (app/api/platos/[id]/activate/route.ts:20:13)
      at Object.<anonymous> (__tests__/US005.6-ActivarDesactivar-Integral.test.ts:131:21)

PASS __tests__/US005.5-ActualizarStock-Integral.test.ts
  ● Console

    console.error
      DETALLE DEL ERROR: Error: El stock no puede ser negativo
          at MenuService.updateStock (/app/services/MenuService.ts:53:13)
          at PATCH (/app/app/api/platos/[id]/stock/route.ts:19:26)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at Object.<anonymous> (/app/__tests__/US005.5-ActualizarStock-Integral.test.ts:136:21)

      20 |     return NextResponse.json({ message: 'Stock actualizado correctamente' });
      21 |   } catch (err: any) {
    > 22 |     console.error("DETALLE DEL ERROR:", err); //
         |             ^
      23 |     if (err.message === 'Producto no encontrado') {
      24 |       return NextResponse.json({ error: err.message }, { status: 404 });
      25 |     }

      at PATCH (app/api/platos/[id]/stock/route.ts:22:13)
      at Object.<anonymous> (__tests__/US005.5-ActualizarStock-Integral.test.ts:136:21)

    console.error
      DETALLE DEL ERROR: Error: Producto no encontrado
          at MenuService.updateStock (/app/services/MenuService.ts:57:13)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at PATCH (/app/app/api/platos/[id]/stock/route.ts:19:5)
          at Object.<anonymous> (/app/__tests__/US005.5-ActualizarStock-Integral.test.ts:149:21)

      20 |     return NextResponse.json({ message: 'Stock actualizado correctamente' });
      21 |   } catch (err: any) {
    > 22 |     console.error("DETALLE DEL ERROR:", err); //
         |             ^
      23 |     if (err.message === 'Producto no encontrado') {
      24 |       return NextResponse.json({ error: err.message }, { status: 404 });
      25 |     }

      at PATCH (app/api/platos/[id]/stock/route.ts:22:13)
      at Object.<anonymous> (__tests__/US005.5-ActualizarStock-Integral.test.ts:149:21)

    console.error
      DETALLE DEL ERROR: Error: Fatal Error
          at Object.<anonymous> (/app/__tests__/US005.5-ActualizarStock-Integral.test.ts:158:43)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      20 |     return NextResponse.json({ message: 'Stock actualizado correctamente' });
      21 |   } catch (err: any) {
    > 22 |     console.error("DETALLE DEL ERROR:", err); //
         |             ^
      23 |     if (err.message === 'Producto no encontrado') {
      24 |       return NextResponse.json({ error: err.message }, { status: 404 });
      25 |     }

      at PATCH (app/api/platos/[id]/stock/route.ts:22:13)
      at Object.<anonymous> (__tests__/US005.5-ActualizarStock-Integral.test.ts:163:21)

PASS __tests__/US021.3-RecomendadoParaTi-integral.test.ts
PASS __tests__/US001-FiltradoPlatos-Completo.test.ts
  ● Console

    console.log
      >>> Probando US001: Filtrado de platos (Caminos Alternativos)...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:36:13)

    console.log
        -> Verificando categoría sin productos...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:58:15)

    console.log
        -> Verificando restaurante inexistente...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:67:15)

    console.log
        -> Verificando fallo de conexión a DB...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:75:15)

    console.log
        -> Verificando parámetros inválidos en URL...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:115:15)

    console.log
        -> Verificando respuesta 500 ante crash de servicio...

      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:128:15)

    console.error
      GET /api/platos error Error: Fatal crash
          at Object.<anonymous> (/app/__tests__/US001-FiltradoPlatos-Completo.test.ts:129:76)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      55 |
      56 |   } catch (err) {
    > 57 |     console.error('GET /api/platos error', err);
         |             ^
      58 |     return NextResponse.json(
      59 |       { error: 'Internal server error' },
      60 |       { status: 500 }

      at GET (app/api/platos/route.ts:57:13)
      at Object.<anonymous> (__tests__/US001-FiltradoPlatos-Completo.test.ts:132:19)

PASS __tests__/US021.2-AnalizarFrecuencia-integral.test.ts
PASS __tests__/US005.3-EliminarPlato-Integral.test.ts
  ● Console

    console.log
      >>> Probando US005: Eliminación de platos en el menú...

      at Object.<anonymous> (__tests__/US005.3-EliminarPlato-Integral.test.ts:18:13)

    console.error
      Error: DB error
          at Object.<anonymous> (/app/__tests__/US005.3-EliminarPlato-Integral.test.ts:143:43)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      18 |     return NextResponse.json({ message: 'Producto eliminado lógicamente' });
      19 |   } catch (err: any) {
    > 20 |     console.error(err);
         |             ^
      21 |     return NextResponse.json({ error: err.message }, { status: 500 });
      22 |   }
      23 | }

      at DELETE (app/api/platos/[id]/delete/route.ts:20:13)
      at Object.<anonymous> (__tests__/US005.3-EliminarPlato-Integral.test.ts:147:21)

PASS __tests__/US009.1-VisualizarImagenes-Integral.test.ts
  ● Console

    console.error
      GET /api/platos/[id]/images error Error: DB fail
          at Object.<anonymous> (/app/__tests__/US009.1-VisualizarImagenes-Integral.test.ts:127:44)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      20 |     return NextResponse.json(result);
      21 |   } catch (err) {
    > 22 |     console.error('GET /api/platos/[id]/images error', err);
         |             ^
      23 |     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      24 |   }
      25 | }

      at GET (app/api/platos/[id]/images/route.ts:22:13)
      at Object.<anonymous> (__tests__/US009.1-VisualizarImagenes-Integral.test.ts:132:21)

PASS __tests__/US020.4-ConsultarHorarios-integral.test.ts
  ● Console

    console.error
      Error: Unexpected
          at Object.<anonymous> (/app/__tests__/US020.4-ConsultarHorarios-integral.test.ts:111:49)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      18 |     return NextResponse.json({ availability });
      19 |   } catch (err) {
    > 20 |     console.error(err);
         |             ^
      21 |     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      22 |   }
      23 | }

      at GET (app/api/platos/[id]/availability/route.ts:20:13)
      at Object.<anonymous> (__tests__/US020.4-ConsultarHorarios-integral.test.ts:114:21)

PASS __tests__/US005.1-CrearPlato-Integral.test.ts
  ● Console

    console.log
      >>> Probando US005: Creación de platos (Caminos Alternativos)...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:25:13)

    console.log
        -> Verificando inserción exitosa...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:38:15)

    console.log
        -> Verificando error de integridad de DB...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:57:15)

    console.log
        -> Verificando validación de duplicados en Service...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:74:15)

    console.log
        -> Verificando validación de precio positivo...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:88:15)

    console.log
        -> Verificando validación de stock no negativo...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:99:15)

    console.log
        -> Verificando rechazo de payload incompleto...

      at Object.<anonymous> (__tests__/US005.1-CrearPlato-Integral.test.ts:115:15)

PASS __tests__/US020.3-EliminarHorario-integral.test.ts
  ● Console

    console.error
      Error: Not found
          at DisponibilidadService.delete (/app/services/DisponibilidadService.ts:73:25)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at DELETE (/app/app/api/platos/[id]/availability/[availabilityId]/route.ts:63:5)
          at Object.<anonymous> (/app/__tests__/US020.3-EliminarHorario-integral.test.ts:102:21)

      64 |     return NextResponse.json({ message: 'Deleted successfully' });
      65 |   } catch (err: any) {
    > 66 |     console.error(err);
         |             ^
      67 |     const status = err.message === 'Not found' ? 404 : 400;
      68 |     return NextResponse.json({ error: err.message }, { status });
      69 |   }

      at DELETE (app/api/platos/[id]/availability/[availabilityId]/route.ts:66:13)
      at Object.<anonymous> (__tests__/US020.3-EliminarHorario-integral.test.ts:102:21)

    console.error
      Error: Some custom error
          at Object.<anonymous> (/app/__tests__/US020.3-EliminarHorario-integral.test.ts:108:41)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      64 |     return NextResponse.json({ message: 'Deleted successfully' });
      65 |   } catch (err: any) {
    > 66 |     console.error(err);
         |             ^
      67 |     const status = err.message === 'Not found' ? 404 : 400;
      68 |     return NextResponse.json({ error: err.message }, { status });
      69 |   }

      at DELETE (app/api/platos/[id]/availability/[availabilityId]/route.ts:66:13)
      at Object.<anonymous> (__tests__/US020.3-EliminarHorario-integral.test.ts:111:21)

PASS __tests__/US011-NotificacionConfirmado.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US011: Creación y Estados de Pedido...

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:22:13)

    console.log
        -> Caso: Checkout válido con items en carrito

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:35:15)

    console.log
        -> Caso: customerId inválido ('abc')

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:57:15)

    console.log
        -> Caso: Error lanzado por PedidoService (Carrito vacío)

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:71:15)

    console.log
        -> Caso: Consulta de historial activo por customerId

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:93:15)

    console.log
        -> Caso: Error crítico en consulta SQL

      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:106:15)

    console.error
      [GET /api/orders] Error: DB Connection Error
          at Object.<anonymous> (/app/__tests__/US011-NotificacionConfirmado.test.ts:107:39)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      54 |     return NextResponse.json(result.rows);
      55 |   } catch (error) {
    > 56 |     console.error("[GET /api/orders]", error);
         |             ^
      57 |     return NextResponse.json({ error: "No se pudieron obtener los pedidos" }, { status: 500 });
      58 |   }
      59 | }

      at GET (app/api/orders/route.ts:56:13)
      at Object.<anonymous> (__tests__/US011-NotificacionConfirmado.test.ts:110:19)

PASS __tests__/US005.4-ActualizarPrecio-Integral.test.ts
PASS __tests__/US021.4-ActualizarRecomendaciones-integral.test.ts
  ● Console

    console.log
      >>> Probando US021.4: Actualización de Recomendaciones...

      at Object.<anonymous> (__tests__/US021.4-ActualizarRecomendaciones-integral.test.ts:27:13)

    console.log
        -> Verificando que las recomendaciones cambian tras registrar un pedido...

      at Object.<anonymous> (__tests__/US021.4-ActualizarRecomendaciones-integral.test.ts:77:15)

    console.log
        -> Verificando que no hay re-calculo si el pedido falla...

      at Object.<anonymous> (__tests__/US021.4-ActualizarRecomendaciones-integral.test.ts:99:17)

PASS __tests__/US026-Reembolso-Integral.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US026: Sistema de Reembolsos...

      at Object.<anonymous> (__tests__/US026-Reembolso-Integral.test.ts:20:13)

    console.log
        -> Verificando mensaje de error: 'Se requiere un motivo de rechazo'

      at Object.<anonymous> (__tests__/US026-Reembolso-Integral.test.ts:48:15)

    console.log
        -> Verificando denegación por falta de adminId

      at Object.<anonymous> (__tests__/US026-Reembolso-Integral.test.ts:69:17)

PASS __tests__/US021.1-GuardarHistorial-integral.test.ts
  ● Console

    console.log
      >>> Probando US021: Guardar historial de pedidos...

      at Object.<anonymous> (__tests__/US021.1-GuardarHistorial-integral.test.ts:24:13)

    console.log
        -> Verificando inserción en pedido_historial con datos reales...

      at Object.<anonymous> (__tests__/US021.1-GuardarHistorial-integral.test.ts:46:15)

PASS __tests__/US013-estado-pedido.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US013: Actualización de Estados (Cocina/Reparto)...

      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:22:13)

    console.log
        -> Caso: Cambio de estado válido

      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:30:13)

    console.log
        -> Caso: Asignación de repartidor + Cambio de estado

      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:49:13)

    console.log
        -> Caso: ID no numérico ('abc')

      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:68:13)

    console.log
        -> Caso: Error de negocio propagado (Status transition fail)

      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:80:13)

    console.error
      [STATUS UPDATE ERROR] Error: Transición no permitida
          at Object.<anonymous> (/app/__tests__/US013-estado-pedido.test.ts:81:80)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      27 |     return NextResponse.json(updated, { status: 200 });
      28 |   } catch (error: any) {
    > 29 |     console.error("[STATUS UPDATE ERROR]", error);
         |             ^
      30 |     return NextResponse.json({ error: error.message }, { status: 500 });
      31 |   }
      32 | }

      at handleStatusUpdate (app/api/orders/[id]/status/route.ts:29:13)
      at Object.<anonymous> (__tests__/US013-estado-pedido.test.ts:88:17)

FAIL __tests__/US003-DetallePlato.test.ts
  ● Console

    console.log
      >>> Probando US003: Visualización de detalles del plato...

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:22:13)

    console.log
        -> Verificando obtención de detalle por ID...

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:35:15)

    console.log
        -> Verificando producto inexistente...

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:52:15)

    console.log
        -> Verificando error de negocio para ID inexistente...

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:80:15)

  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Persistencia (ProductoDAO.getProductById) › ✓ debe retornar el detalle completo si el producto existe (Camino Feliz)

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - StringContaining "WHERE p.id = $1",
    + "SELECT * FROM products WHERE id = $1",
      [101],

    Number of calls: 1

      46 |       const result = await ProductoDAO.getProductById(101);
      47 |       expect(result).toEqual(fakeProduct);
    > 48 |       expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE p.id = $1"), [101]);
         |                         ^
      49 |     });
      50 |
      51 |     it("⚠ debe retornar null si el producto no existe (Camino Alternativo)", async () => {

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:48:25)

  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Servicios (MenuService.getProductDetails) › ✓ debe retornar el producto formateado si existe

    TypeError: service.getProductDetails is not a function

      72 |
      73 |       const service = new MenuService();
    > 74 |       const result = await service.getProductDetails(1);
         |                                    ^
      75 |       
      76 |       expect(result).toEqual({ product: fakeProduct });
      77 |     });

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:74:36)

  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Servicios (MenuService.getProductDetails) › ⚠ debe lanzar error si el producto no existe

    TypeError: service.getProductDetails is not a function

      82 |
      83 |       const service = new MenuService();
    > 84 |       await expect(service.getProductDetails(999)).rejects.toThrow("Producto no encontrado");
         |                            ^
      85 |     });
      86 |   });
      87 | });

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:84:28)

FAIL __tests__/US004-DashboardChef.test.ts
  ● Console

    console.log
      >>> Probando US004: Dashboard de Pedidos en Cocina...

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:22:13)

    console.log
        -> Verificando obtención de pedidos activos para cocina...

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:35:15)

    console.log
        -> Verificando dashboard vacío...

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:51:15)

    console.log
        -> Verificando validación de flujo de estados (Chef)...

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:63:15)

    console.log
        -> Verificando inicio de preparación de pedido...

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:74:17)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Persistencia (PedidoDAO) › ✓ debe obtener pedidos con estados PENDING o PREPARING (Camino Feliz)

    TypeError: PedidoDAO_1.PedidoDAO.getPendingOrdersForChef is not a function

      40 |       mockQuery.mockResolvedValueOnce({ rows: fakeOrders });
      41 |
    > 42 |       const result = await PedidoDAO.getPendingOrdersForChef(1); // restaurantId=1
         |                                      ^
      43 |       expect(result).toHaveLength(2);
      44 |       expect(mockQuery).toHaveBeenCalledWith(
      45 |         expect.stringMatching(/status\s+IN\s*\('\s*PENDING\s*',\s*'\s*PREPARING\s*'\)/i),

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:42:38)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Persistencia (PedidoDAO) › ⚠ debe retornar vacío si no hay pedidos pendientes (Camino Alternativo)

    TypeError: PedidoDAO_1.PedidoDAO.getPendingOrdersForChef is not a function

      51 |       console.log("  -> Verificando dashboard vacío...");
      52 |       mockQuery.mockResolvedValueOnce({ rows: [] });
    > 53 |       const result = await PedidoDAO.getPendingOrdersForChef(1);
         |                                      ^
      54 |       expect(result).toEqual([]);
      55 |     });
      56 |   });

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:53:38)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Servicios (PedidoService.updateStatus) › ⚠ debe rechazar transiciones de estado inválidas (Lógica de Negocio)

    expect(received).rejects.toThrow()

    Received promise resolved instead of rejected
    Resolved to value: {"id": 1, "items_count": 3, "status": "PENDING"}

      67 |       const service = new PedidoService();
      68 |       // Un chef no puede poner en 'PREPARING' algo que ya se entregó
    > 69 |       await expect(service.updateOrderStatus(1, 'PREPARING'))
         |             ^
      70 |         .rejects.toThrow("Transición de estado no permitida");
      71 |     });
      72 |

      at expect (node_modules/@jest/expect/node_modules/expect/build/index.js:2116:15)
      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:69:13)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Servicios (PedidoService.updateStatus) › ✓ debe permitir cambiar de PENDING a PREPARING (Camino Feliz)

    Property `updateStatus` does not exist in the provided object

      74 |         console.log("  -> Verificando inicio de preparación de pedido...");
      75 |         jest.spyOn(PedidoDAO, 'getOrderById').mockResolvedValue({ id: 1, status: 'PENDING' });
    > 76 |         const spyUpdate = jest.spyOn(PedidoDAO, 'updateStatus').mockResolvedValue({ success: true });
         |                                ^
      77 |
      78 |         const service = new PedidoService();
      79 |         await service.updateOrderStatus(1, 'PREPARING');

      at ModuleMocker.spyOn (node_modules/jest-mock/build/index.js:593:13)
      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:76:32)

FAIL __tests__/notas-pedido.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/deliveryAddresses mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      15 | }));
      16 |
    > 17 | jest.mock("@/lib/deliveryAddresses", () => ({
         |      ^
      18 |   getDeliveryAddressSnapshot: (...args: unknown[]) =>
      19 |     mockGetDeliveryAddressSnapshot(...args),
      20 | }));

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/notas-pedido.test.ts:17:6)

PASS __tests__/US001.2-BuscadorGlobal.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US001.2: Buscador Global de Catálogo...

      at Object.<anonymous> (__tests__/US001.2-BuscadorGlobal.test.ts:22:13)

    console.log
        -> Verificando búsqueda parcial de 'Pizza'...

      at Object.<anonymous> (__tests__/US001.2-BuscadorGlobal.test.ts:35:15)

    console.log
        -> Verificando validación de longitud de término...

      at Object.<anonymous> (__tests__/US001.2-BuscadorGlobal.test.ts:56:15)

    console.log
        -> Verificando delegación al DAO...

      at Object.<anonymous> (__tests__/US001.2-BuscadorGlobal.test.ts:63:17)

PASS __tests__/US016-Autenticacion.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US016/US027: Seguridad, Autenticación y Roles...

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:22:13)

    console.log
        -> Caso: Login exitoso de Administrador

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:33:15)

    console.log
        -> Caso: Usuario no registrado

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:46:15)

    console.log
        -> Caso: Password mismatch

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:54:15)

    console.log
        -> Caso: Registro de nuevo cliente

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:65:15)

    console.log
        -> Caso: Email duplicado

      at Object.<anonymous> (__tests__/US016-Autenticacion.test.ts:76:15)

PASS __tests__/estado-pedido.test.ts
PASS __tests__/US006-US015-Reportes.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US006 (Ventas) y US015 (Exportación)...

      at Object.<anonymous> (__tests__/US006-US015-Reportes.test.ts:24:13)

    console.log
        -> Caso: Consulta de ventas del día

      at Object.<anonymous> (__tests__/US006-US015-Reportes.test.ts:34:15)

    console.log
        -> Caso: Fecha nula

      at Object.<anonymous> (__tests__/US006-US015-Reportes.test.ts:48:15)

    console.log
        -> Caso: Exportación a Excel

      at Object.<anonymous> (__tests__/US006-US015-Reportes.test.ts:56:15)

    console.log
        -> Caso: Exportación a CSV simplificado

      at Object.<anonymous> (__tests__/US006-US015-Reportes.test.ts:69:15)

PASS __tests__/US025-GestionRestaurante.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US025: Configuración de Restaurante...

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:18:13)

    console.log
        -> Caso: Registro inicial completo

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:29:15)

    console.log
        -> Caso: Un dueño = Un restaurante (Regla de Negocio)

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:48:15)

    console.log
        -> Caso: Horario inválido (22:00 a 09:00)

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:56:15)

    console.log
        -> Caso: Baja lógica del restaurante

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:72:15)

    console.warn
      [RestaurantService] Desactivando restaurante 1. Verificando integridad...

       95 |       // Validación de negocio: No dar de baja si hay pedidos activos (Simulado por ahora)
       96 |       // En una fase posterior se consultaría PedidoDAO.hasActiveOrders(id)
    >  97 |       console.warn(`[RestaurantService] Desactivando restaurante ${id}. Verificando integridad...`);
          |               ^
       98 |     }
       99 |     await RestaurantDAO.actualizarRestaurantEntity(id, { is_active: activo });
      100 |   }

      at RestaurantService.toggleActivo (services/RestaurantService.ts:97:15)
      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:75:21)

    console.log
        -> Caso: Consulta de perfil detallado

      at Object.<anonymous> (__tests__/US025-GestionRestaurante.test.ts:83:15)

PASS __tests__/US002-carrito-compras.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US002: Gestión del Carrito Virtual...

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:21:13)

    console.log
        -> Caso: Producto disponible con stock

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:32:15)

    console.log
        -> Caso: Cantidad = 0 (Debe lanzar Error)

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:48:15)

    console.log
        -> Caso: Stock = 0

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:54:15)

    console.log
        -> Caso: Pedir 11 cuando hay 10 en stock

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:63:15)

    console.log
        -> Caso: Actualizar item existente

      at Object.<anonymous> (__tests__/US002-carrito-compras.test.ts:73:15)

FAIL __tests__/carrito-compras.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/cart mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      14 | }));
      15 |
    > 16 | import { addItemToCart, updateCartItemQuantity } from "@/lib/cart";
         | ^
      17 |
      18 | describe("Carrito de compras", () => {
      19 |   beforeEach(() => {

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/carrito-compras.test.ts:16:1)

FAIL __tests__/US008-ControlStock.test.ts
  ● Console

    console.log
      >>> Probando US008: Control de Stock Automático...

      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:22:13)

    console.log
        -> Verificando actualización de stock y disponibilidad automática...

      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:35:15)

    console.log
        -> Verificando is_available = false cuando stock es 0...

      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:48:15)

    console.log
        -> Verificando rechazo de stock negativo...

      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:64:15)

  ● US008: Gestión de Menú – Control de Stock › Capa de Servicios (MenuService.updateStock) › ✓ debe delegar al DAO correctamente

    TypeError: Cannot read properties of undefined (reading 'rows')

      31 |     );
      32 |
    > 33 |     return result.rows[0] || null;
         |                   ^
      34 |   }
      35 |
      36 |   static async updateActiveStatus(

      at Function.findByIdIncludingInactive (models/daos/ProductoDAO.ts:33:19)
      at MenuService.updateStock (services/MenuService.ts:55:21)
      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:73:9)

FAIL __tests__/direccion-entrega.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/deliveryAddresses mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      12 | }));
      13 |
    > 14 | import {
         | ^
      15 |   createDeliveryAddress,
      16 |   normalizeDeliveryAddressInput,
      17 | } from "@/lib/deliveryAddresses";

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/direccion-entrega.test.ts:14:1)

PASS __tests__/US024-CancelarPedido-Servicios.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US024: Cancelación y Reversión de Stock...

      at Object.<anonymous> (__tests__/US024-CancelarPedido-Servicios.test.ts:26:13)

    console.log
        -> Caso: Pedido DELIVERED no puede cancelarse

      at Object.<anonymous> (__tests__/US024-CancelarPedido-Servicios.test.ts:61:15)

PASS __tests__/US010-AsignacionRepartidor.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US010: Asignación de repartidores...

      at Object.<anonymous> (__tests__/US010-AsignacionRepartidor.test.ts:22:13)

    console.log
        -> Caso: Asignación exitosa de repartidor a orden activa

      at Object.<anonymous> (__tests__/US010-AsignacionRepartidor.test.ts:30:13)

    console.log
        -> Caso: Error de base de datos en asignación

      at Object.<anonymous> (__tests__/US010-AsignacionRepartidor.test.ts:53:13)

    console.error
      [STATUS UPDATE ERROR] Error: Database error on assignment
          at Object.<anonymous> (/app/__tests__/US010-AsignacionRepartidor.test.ts:54:37)
          at Promise.finally.completed (/app/node_modules/jest-circus/build/jestAdapterInit.js:1557:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/app/node_modules/jest-circus/build/jestAdapterInit.js:1497:10)
          at _callCircusTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:1007:40)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at _runTest (/app/node_modules/jest-circus/build/jestAdapterInit.js:947:3)
          at /app/node_modules/jest-circus/build/jestAdapterInit.js:849:7
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:862:11)
          at _runTestsForDescribeBlock (/app/node_modules/jest-circus/build/jestAdapterInit.js:857:11)
          at run (/app/node_modules/jest-circus/build/jestAdapterInit.js:761:3)
          at runAndTransformResultsToJestFormat (/app/node_modules/jest-circus/build/jestAdapterInit.js:1918:21)
          at jestAdapter (/app/node_modules/jest-circus/build/runner.js:101:19)
          at runTestInternal (/app/node_modules/jest-runner/build/testWorker.js:275:16)
          at runTest (/app/node_modules/jest-runner/build/testWorker.js:343:7)
          at Object.worker (/app/node_modules/jest-runner/build/testWorker.js:497:12)

      27 |     return NextResponse.json(updated, { status: 200 });
      28 |   } catch (error: any) {
    > 29 |     console.error("[STATUS UPDATE ERROR]", error);
         |             ^
      30 |     return NextResponse.json({ error: error.message }, { status: 500 });
      31 |   }
      32 | }

      at handleStatusUpdate (app/api/orders/[id]/status/route.ts:29:13)
      at Object.<anonymous> (__tests__/US010-AsignacionRepartidor.test.ts:61:17)

PASS __tests__/US007-notas-pedido.test.ts
  ● Console

    console.log
      >>> Probando US007: Notas Especiales en Pedidos...

      at Object.<anonymous> (__tests__/US007-notas-pedido.test.ts:24:13)

PASS __tests__/US019.1-Ranking-integral.test.ts
PASS __tests__/US014-direccion-entrega.test.ts
  ● Console

    console.log
      >>> [LOGICA] Verificando US014: Gestión de Direcciones de Entrega...

      at Object.<anonymous> (__tests__/US014-direccion-entrega.test.ts:18:13)

    console.log
        -> Caso: Datos completos y correctos

      at Object.<anonymous> (__tests__/US014-direccion-entrega.test.ts:29:15)

    console.log
        -> Caso: Datos faltantes

      at Object.<anonymous> (__tests__/US014-direccion-entrega.test.ts:44:15)

    console.log
        -> Caso: CP inválido ('123')

      at Object.<anonymous> (__tests__/US014-direccion-entrega.test.ts:50:15)

    console.log
        -> Caso: Eliminación de dirección

      at Object.<anonymous> (__tests__/US014-direccion-entrega.test.ts:64:15)

PASS __tests__/US019.2-Ranking-integral.test.ts
PASS __tests__/US019.4-Ranking-integral.test.ts
PASS __tests__/US019.3-Ranking-integral.test.ts

Summary of all failing tests
FAIL __tests__/US003-DetallePlato.test.ts
  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Persistencia (ProductoDAO.getProductById) › ✓ debe retornar el detalle completo si el producto existe (Camino Feliz)

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - StringContaining "WHERE p.id = $1",
    + "SELECT * FROM products WHERE id = $1",
      [101],

    Number of calls: 1

      46 |       const result = await ProductoDAO.getProductById(101);
      47 |       expect(result).toEqual(fakeProduct);
    > 48 |       expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE p.id = $1"), [101]);
         |                         ^
      49 |     });
      50 |
      51 |     it("⚠ debe retornar null si el producto no existe (Camino Alternativo)", async () => {

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:48:25)

  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Servicios (MenuService.getProductDetails) › ✓ debe retornar el producto formateado si existe

    TypeError: service.getProductDetails is not a function

      72 |
      73 |       const service = new MenuService();
    > 74 |       const result = await service.getProductDetails(1);
         |                                    ^
      75 |       
      76 |       expect(result).toEqual({ product: fakeProduct });
      77 |     });

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:74:36)

  ● US003: Experiencia del Cliente – Detalle del plato › Capa de Servicios (MenuService.getProductDetails) › ⚠ debe lanzar error si el producto no existe

    TypeError: service.getProductDetails is not a function

      82 |
      83 |       const service = new MenuService();
    > 84 |       await expect(service.getProductDetails(999)).rejects.toThrow("Producto no encontrado");
         |                            ^
      85 |     });
      86 |   });
      87 | });

      at Object.<anonymous> (__tests__/US003-DetallePlato.test.ts:84:28)

FAIL __tests__/US004-DashboardChef.test.ts
  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Persistencia (PedidoDAO) › ✓ debe obtener pedidos con estados PENDING o PREPARING (Camino Feliz)

    TypeError: PedidoDAO_1.PedidoDAO.getPendingOrdersForChef is not a function

      40 |       mockQuery.mockResolvedValueOnce({ rows: fakeOrders });
      41 |
    > 42 |       const result = await PedidoDAO.getPendingOrdersForChef(1); // restaurantId=1
         |                                      ^
      43 |       expect(result).toHaveLength(2);
      44 |       expect(mockQuery).toHaveBeenCalledWith(
      45 |         expect.stringMatching(/status\s+IN\s*\('\s*PENDING\s*',\s*'\s*PREPARING\s*'\)/i),

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:42:38)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Persistencia (PedidoDAO) › ⚠ debe retornar vacío si no hay pedidos pendientes (Camino Alternativo)

    TypeError: PedidoDAO_1.PedidoDAO.getPendingOrdersForChef is not a function

      51 |       console.log("  -> Verificando dashboard vacío...");
      52 |       mockQuery.mockResolvedValueOnce({ rows: [] });
    > 53 |       const result = await PedidoDAO.getPendingOrdersForChef(1);
         |                                      ^
      54 |       expect(result).toEqual([]);
      55 |     });
      56 |   });

      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:53:38)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Servicios (PedidoService.updateStatus) › ⚠ debe rechazar transiciones de estado inválidas (Lógica de Negocio)

    expect(received).rejects.toThrow()

    Received promise resolved instead of rejected
    Resolved to value: {"id": 1, "items_count": 3, "status": "PENDING"}

      67 |       const service = new PedidoService();
      68 |       // Un chef no puede poner en 'PREPARING' algo que ya se entregó
    > 69 |       await expect(service.updateOrderStatus(1, 'PREPARING'))
         |             ^
      70 |         .rejects.toThrow("Transición de estado no permitida");
      71 |     });
      72 |

      at expect (node_modules/@jest/expect/node_modules/expect/build/index.js:2116:15)
      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:69:13)

  ● US004: Eficiencia Operativa – Dashboard del Chef › Capa de Servicios (PedidoService.updateStatus) › ✓ debe permitir cambiar de PENDING a PREPARING (Camino Feliz)

    Property `updateStatus` does not exist in the provided object

      74 |         console.log("  -> Verificando inicio de preparación de pedido...");
      75 |         jest.spyOn(PedidoDAO, 'getOrderById').mockResolvedValue({ id: 1, status: 'PENDING' });
    > 76 |         const spyUpdate = jest.spyOn(PedidoDAO, 'updateStatus').mockResolvedValue({ success: true });
         |                                ^
      77 |
      78 |         const service = new PedidoService();
      79 |         await service.updateOrderStatus(1, 'PREPARING');

      at ModuleMocker.spyOn (node_modules/jest-mock/build/index.js:593:13)
      at Object.<anonymous> (__tests__/US004-DashboardChef.test.ts:76:32)

FAIL __tests__/notas-pedido.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/deliveryAddresses mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      15 | }));
      16 |
    > 17 | jest.mock("@/lib/deliveryAddresses", () => ({
         |      ^
      18 |   getDeliveryAddressSnapshot: (...args: unknown[]) =>
      19 |     mockGetDeliveryAddressSnapshot(...args),
      20 | }));

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/notas-pedido.test.ts:17:6)

FAIL __tests__/carrito-compras.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/cart mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      14 | }));
      15 |
    > 16 | import { addItemToCart, updateCartItemQuantity } from "@/lib/cart";
         | ^
      17 |
      18 | describe("Carrito de compras", () => {
      19 |   beforeEach(() => {

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/carrito-compras.test.ts:16:1)

FAIL __tests__/US008-ControlStock.test.ts
  ● US008: Gestión de Menú – Control de Stock › Capa de Servicios (MenuService.updateStock) › ✓ debe delegar al DAO correctamente

    TypeError: Cannot read properties of undefined (reading 'rows')

      31 |     );
      32 |
    > 33 |     return result.rows[0] || null;
         |                   ^
      34 |   }
      35 |
      36 |   static async updateActiveStatus(

      at Function.findByIdIncludingInactive (models/daos/ProductoDAO.ts:33:19)
      at MenuService.updateStock (services/MenuService.ts:55:21)
      at Object.<anonymous> (__tests__/US008-ControlStock.test.ts:73:9)

FAIL __tests__/direccion-entrega.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/deliveryAddresses mapped as:
    /app/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/app/$1"
      },
      "resolver": undefined
    }

      12 | }));
      13 |
    > 14 | import {
         | ^
      15 |   createDeliveryAddress,
      16 |   normalizeDeliveryAddressInput,
      17 | } from "@/lib/deliveryAddresses";

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.<anonymous> (__tests__/direccion-entrega.test.ts:14:1)


Test Suites: 6 failed, 39 passed, 45 total
Tests:       8 failed, 323 passed, 331 total
Snapshots:   0 total
Time:        11.708 s
Ran all test suites.
