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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const updated = await productService.updateProduct(productId, {
      name
    });

    return NextResponse.json({
      message: 'Nombre actualizado',
      product: updated
    });

  } catch (err: any) {
    console.error('PATCH nombre error', err);

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}