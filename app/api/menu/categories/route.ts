// app/api/menu/categories/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/config/db';

export async function GET() {
  try {
    const result = await db.query(
      `SELECT id, name FROM categories ORDER BY name`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/menu/categories]', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}