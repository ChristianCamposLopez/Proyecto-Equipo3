// app/api/reviews/route.ts
// API Route — US016: Reseñas de productos

import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/services/ReviewService';

const reviewService = new ReviewService();

/**
 * GET /api/reviews?productId=X
 * US016: Obtiene reseñas de un producto o todas si no se especifica.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const reviews = await reviewService.getByProductId(parseInt(productId, 10));
      const average = await reviewService.getAverageRating(parseInt(productId, 10));
      return NextResponse.json({ reviews, ...average });
    }

    const reviews = await reviewService.getAll();
    return NextResponse.json(reviews);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * US016: Crea una nueva reseña.
 * Body: { product_id, customer_id, rating, comment }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, customer_id, rating, comment } = body;

    if (!product_id || !customer_id || !rating) {
      return NextResponse.json(
        { error: 'Campos requeridos: product_id, customer_id, rating' },
        { status: 400 }
      );
    }

    const review = await reviewService.create(
      product_id,
      customer_id,
      rating,
      comment || ''
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
}
