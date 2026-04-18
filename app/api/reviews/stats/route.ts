// app/api/reviews/stats/route.ts
// API Route — US017: Estadísticas de calificaciones para admin

import { NextResponse } from 'next/server';
import { ReviewService } from '@/services/ReviewService';

const reviewService = new ReviewService();

/**
 * GET /api/reviews/stats
 * US017: Retorna estadísticas de calificación por producto.
 */
export async function GET() {
  try {
    const stats = await reviewService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
