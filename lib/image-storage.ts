// lib/image-storage.ts
import fs from 'fs/promises';
import path from 'path';

export class ImageStorageService {
  private storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'public', 'uploads');
  }

  async upload(buffer: Buffer, fileName: string): Promise<string> {
    await fs.mkdir(this.storagePath, { recursive: true });
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.storagePath, safeName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${safeName}`;
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const full = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
      await fs.unlink(full);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(filePath: string): string {
    return filePath || '/images/default-product.png';
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const full = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
      await fs.access(full);
      return true;
    } catch {
      return false;
    }
  }
}
