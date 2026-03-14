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

    const body = await request.json();
    const { price } = body;

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await productService.updatePrice(productId, price);

    return NextResponse.json({
      message: 'Precio actualizado correctamente'
    });

  } catch (error) {

    if (error instanceof Error) {

      if (error.message === 'Producto no encontrado') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error.message === 'El precio debe ser mayor a 0') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

    }

    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );

  }

}