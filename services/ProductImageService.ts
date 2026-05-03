// services/ProductImageService.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProductImageDAO } from '@/models/daos/ProductImageDAO';
import path from 'path';
import fs from 'fs/promises';

// Carpeta donde se guardan las imágenes en el servidor
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Asegura que la carpeta exista
async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// ─── US009.1: GET /api/products/[id]/image ────────────────────────────────
export async function getProductImageEntity(
  _req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    const image = await ProductImageDAO.getImageByProductId(productId);
    if (!image) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json(image);
  } catch (error) {
    console.error('[getProductImageEntity]', error);
    return NextResponse.json({ error: 'Error al obtener imagen' }, { status: 500 });
  }
}

// ─── US009.2: POST /api/products/[id]/image ───────────────────────────────
export async function uploadProductImageEntity(
  req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    // Validar tipo MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usa JPG, PNG o WEBP.' },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no debe superar 5 MB.' },
        { status: 400 }
      );
    }

    // Nombre único para evitar colisiones
    const ext = file.name.split('.').pop();
    const filename = `product_${productId}_${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Escribir archivo en disco
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Borrar imagen anterior si existe
    const existing = await ProductImageDAO.getImageByProductId(productId);
    if (existing?.image_url) {
      const oldFilename = existing.image_url.split('/').pop();
      if (oldFilename) {
        const oldPath = path.join(UPLOAD_DIR, oldFilename);
        await fs.unlink(oldPath).catch(() => {}); // silencioso si no existe
      }
    }

    // URL pública accesible desde /uploads/products/...
    const publicUrl = `/uploads/products/${filename}`;
    const updated = await ProductImageDAO.upsertImage(productId, publicUrl);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[uploadProductImageEntity]', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
}

// ─── US009.3: DELETE /api/products/[id]/image ─────────────────────────────
export async function deleteProductImageEntity(
  _req: NextRequest,
  productId: number
): Promise<NextResponse> {
  try {
    // Obtener URL antes de borrar para eliminar el archivo físico
    const existing = await ProductImageDAO.getImageByProductId(productId);

    if (!existing?.image_url) {
      return NextResponse.json(
        { error: 'Este platillo no tiene imagen registrada' },
        { status: 404 }
      );
    }

    // Eliminar archivo físico del servidor
    const filename = existing.image_url.split('/').pop();
    if (filename) {
      const filepath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filepath).catch(() => {}); // silencioso si ya no existe
    }

    // Limpiar referencia en BD
    await ProductImageDAO.deleteImage(productId);

    return NextResponse.json({ message: 'Imagen eliminada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('[deleteProductImageEntity]', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
  }
}