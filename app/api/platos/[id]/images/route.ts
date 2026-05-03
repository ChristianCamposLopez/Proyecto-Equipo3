// app/api/platos/[id]/images/route.ts
import { NextResponse } from 'next/server';
import { ImagenService } from '@/services/ImagenService';

const imagenController = new ImagenService();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const result = await imagenController.getImages(productId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/platos/[id]/images error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { fileName, data, format, isPrimary } = body;

    if (!fileName || !data || !format) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await imagenController.uploadImage(productId, {
      fileName,
      data,
      format,
      isPrimary,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('POST /api/platos/[id]/images error', err);
    const status = err.message.includes('not allowed') || err.message.includes('too large') ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status });
  }
}