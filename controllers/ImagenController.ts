// controllers/ImagenController.ts
import fs from 'fs/promises';
import path from 'path';
import { ImagenDAO } from '../models/daos/ImagenDAO';

export class ImagenController {
  // Obtener imágenes de un producto
  async getImages(productId: number) {
    const images = await ImagenDAO.getImagesByProductId(productId);
    return { images };
  }

  // Subir una nueva imagen (recibe base64)
  async uploadImage(
    productId: number,
    payload: {
      fileName: string;
      data: string;      // base64 string (puede incluir data:image/...;base64,)
      format: string;
      isPrimary?: boolean;
    }
  ) {
    const { fileName, data, format, isPrimary = false } = payload;

    // Validar formato
    const allowed = ['jpeg', 'jpg', 'png', 'webp'];
    const fmt = format.toLowerCase();
    if (!allowed.includes(fmt)) {
      throw new Error('Format not allowed');
    }

    // Decodificar base64 a buffer
    let base64Data = data;
    const matches = data.match(/^data:([\w/+\-.]+);base64,(.*)$/);
    if (matches) {
      base64Data = matches[2];
    }
    const buffer = Buffer.from(base64Data, 'base64');

    // Validar tamaño (2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new Error('File too large (max 2MB)');
    }

    // Guardar archivo en disco
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);
    await fs.writeFile(filePath, buffer);
    const publicPath = `/uploads/${safeName}`;

    // Si la imagen es primaria, desmarcar las demás
    if (isPrimary) {
      await ImagenDAO.unsetPrimaryFlag(productId);
    }

    // Insertar en BD
    const newImage = await ImagenDAO.insertImage({
      product_id: productId,
      image_path: publicPath,
      file_name: fileName,
      file_size: buffer.length,
      format: fmt,
      is_primary: isPrimary,
    });

    return { image: newImage };
  }

  // controllers/ImagenController.ts (adiciones)
  async deleteImage(imageId: number) {
    const image = await ImagenDAO.getById(imageId);
    if (!image) throw new Error('Image not found');

    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), 'public', image.image_path);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn('File not found on disk:', image.image_path);
    }

    // Eliminar registro
    await ImagenDAO.delete(imageId);

    // Si era primaria, asignar la más reciente como primaria
    if (image.is_primary) {
      const newest = await ImagenDAO.getNewestByProductId(image.product_id);
      if (newest) {
        await ImagenDAO.setPrimary(newest.id);
      }
    }
    return true;
  }
}