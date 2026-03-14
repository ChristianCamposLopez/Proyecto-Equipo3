import { NextResponse } from 'next/server';
import { db } from '../../../../../config/db';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await context.params;

  const id = parseInt(imageId, 10);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid image id' },
      { status: 400 }
    );
  }

  try {
    // ✅ Obtener info antes de borrar
    const imageResult = await db.query(
      `
      SELECT product_id, image_path, is_primary
      FROM product_images
      WHERE id = $1
      `,
      [id]
    );

    if (imageResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const { product_id, image_path, is_primary } =
      imageResult.rows[0];

    // ===============================
    // ✅ 1. BORRAR ARCHIVO FÍSICO
    // ===============================
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        image_path
      );

      await fs.unlink(filePath);
    } catch (fileErr) {
      console.warn(
        'Image file not found on disk:',
        image_path
      );
      // no detenemos el proceso
    }

    // ===============================
    // ✅ 2. DELETE REAL EN BD
    // ===============================
    await db.query(
      `DELETE FROM product_images WHERE id = $1`,
      [id]
    );

    // ===============================
    // ✅ 3. SI ERA PRINCIPAL → reasignar
    // ===============================
    if (is_primary) {
      await db.query(
        `
        UPDATE product_images
        SET is_primary = TRUE
        WHERE id = (
          SELECT id
          FROM product_images
          WHERE product_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        )
        `,
        [product_id]
      );
    }

    return NextResponse.json({
      message: 'Image deleted permanently',
    });

  } catch (err) {
    console.error('DELETE image error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}