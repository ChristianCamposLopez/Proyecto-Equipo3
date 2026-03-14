import { NextResponse, NextRequest } from 'next/server';
import { ProductService } from '../../../../lib/product.service';

const productService = new ProductService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    await productService.deactivateProduct(productId);

    return NextResponse.json({
      message: 'Producto desactivado exitosamente'
    });

  } catch (err) {
    console.error('DELETE /api/platos/[id] error', err);

    if (err instanceof Error && err.message === 'Producto no encontrado') {
      return NextResponse.json(
        { error: err.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}