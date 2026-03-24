import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../../../lib/product.service';

const productService = new ProductService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { descripcion } = body;

    // descripción puede ser null o string
    const updated = await productService.updateProduct(productId, {
      descripcion: descripcion ?? null
    });

    return NextResponse.json({
      message: 'Descripción actualizada',
      product: updated
    });

  } catch (err: any) {
    console.error('PATCH descripcion error', err);

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}