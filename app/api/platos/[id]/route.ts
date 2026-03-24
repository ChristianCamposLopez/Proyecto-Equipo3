import { NextResponse, NextRequest } from 'next/server';
import { ProductService } from '../../../../lib/product.service';
import { ProductRepository } from '../../../../lib/repositories/product.repository';

const productService = new ProductService();
const repository = new ProductRepository();

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

export async function GET(
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

    const product = await repository.findById_2(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product
    });

  } catch (err) {
    console.error('GET /api/platos/[id] error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}