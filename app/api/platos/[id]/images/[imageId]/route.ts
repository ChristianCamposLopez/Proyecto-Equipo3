// app/api/platos/[id]/images/[imageId]/route.ts
import { NextResponse } from 'next/server';
import { ImagenService } from '@/services/ImagenService';

const controller = new ImagenService();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const id = Number(imageId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });
    }
    await controller.deleteImage(id);
    return NextResponse.json({ message: 'Image deleted permanently' });
  } catch (err: any) {
    console.error(err);
    const status = err.message === 'Image not found' ? 404 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}