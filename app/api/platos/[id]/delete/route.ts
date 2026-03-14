import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '../../../../../lib/product.service';

const productService = new ProductService();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;

    const productId = Number(id);

    await productService.eliminarProduct(productId);

    return NextResponse.json({
      message: 'Producto eliminado lógicamente'
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );

  }
}