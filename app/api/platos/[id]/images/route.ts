import { NextResponse } from 'next/server';
import { db } from '../../../../../config/db';
import fs from 'fs/promises';
import path from 'path';

/* =====================================================
   GET → listar imágenes de un producto
===================================================== */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const productId = parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid product id' },
      { status: 400 }
    );
  }

  try {
    const result = await db.query(
      `
      SELECT id, image_path, is_primary
      FROM product_images
      WHERE product_id = $1
      AND deleted_at IS NULL
      ORDER BY is_primary DESC, created_at DESC
      `,
      [productId]
    );

    return NextResponse.json({
      images: result.rows,
    });
  } catch (err) {
    console.error('GET /api/platos/[id]/images error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST → subir imagen
===================================================== */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const productId = parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return NextResponse.json(
      { error: 'Invalid product id' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const {
      fileName,
      data,
      format,
      isPrimary,
    } = body as {
      fileName: string;
      data: string;
      format: string;
      isPrimary?: boolean;
    };

    if (!fileName || !data || !format) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      );
    }

    /* ===== validar formato ===== */
    const allowed = ['jpeg', 'jpg', 'png', 'webp'];
    const fmt = format.toLowerCase();

    if (!allowed.includes(fmt)) {
      return NextResponse.json(
        { error: 'Format not allowed' },
        { status: 400 }
      );
    }

    /* ===== base64 → buffer ===== */
    const matches =
      data.match(/^data:([\w/+\-.]+);base64,(.*)$/);

    const buffer = matches
      ? Buffer.from(matches[2], 'base64')
      : Buffer.from(data, 'base64');

    /* ===== tamaño máximo 2MB ===== */
    const maxBytes = 2 * 1024 * 1024;

    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { error: 'File too large (max 2MB)' },
        { status: 400 }
      );
    }

    /* ===== guardar archivo ===== */
    const uploadsDir = path.join(
      process.cwd(),
      'public',
      'uploads'
    );

    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${fileName.replace(
      /[^a-zA-Z0-9.-]/g,
      '_'
    )}`;

    const filePath = path.join(uploadsDir, safeName);

    await fs.writeFile(filePath, buffer);

    const publicPath = `/uploads/${safeName}`;

    /* ===== solo una primaria ===== */
    if (isPrimary) {
      await db.query(
        `
        UPDATE product_images
        SET is_primary = FALSE
        WHERE product_id = $1
        `,
        [productId]
      );
    }

    /* ===== insertar en BD ===== */
    const insertQ = `
      INSERT INTO product_images
      (product_id, image_path, file_name, file_size, format, is_primary)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `;

    const res = await db.query(insertQ, [
      productId,
      publicPath,
      fileName,
      buffer.length,
      fmt,
      !!isPrimary,
    ]);

    return NextResponse.json({
      image: res.rows[0],
    });
  } catch (err) {
    console.error(
      'POST /api/platos/[id]/images error',
      err
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}