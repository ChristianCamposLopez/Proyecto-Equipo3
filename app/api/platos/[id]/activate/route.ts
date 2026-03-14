import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../../../lib/product.service';

const productService = new ProductService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;   // 👈 ESTA ES LA SOLUCIÓN

    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await productService.activateProduct(productId);

    return NextResponse.json({
      message: 'Producto activado exitosamente'
    });

  } catch (err) {

    console.error('PATCH activate error', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );

  }
}