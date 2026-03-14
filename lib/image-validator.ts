// lib/image-validator.ts
import { createCanvas, loadImage } from 'canvas';

export class ImageValidator {
  private static MAX_SIZE = 2 * 1024 * 1024; // 2MB
  private static ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
  private static MIN_WIDTH = 500;
  private static MIN_HEIGHT = 500;

  static validateFormat(format: string): boolean {
    return this.ALLOWED_FORMATS.includes(format.toLowerCase());
  }

  static validateSize(fileSize: number): boolean {
    return fileSize > 0 && fileSize <= this.MAX_SIZE;
  }

  async validateDimensions(buffer: Buffer): Promise<boolean> {
    try {
      const img = await loadImage(buffer);
      return img.width >= ImageValidator.MIN_WIDTH && img.height >= ImageValidator.MIN_HEIGHT;
    } catch {
      return false;
    }
  }

  static validate(fileName: string, fileSize: number, format: string): { valid: boolean; error?: string } {
    if (!fileName || fileName.trim().length === 0) return { valid: false, error: 'File name is required' };
    if (!this.validateFormat(format)) return { valid: false, error: `Format ${format} not allowed. Allowed: ${this.ALLOWED_FORMATS.join(', ')}` };
    if (!this.validateSize(fileSize)) return { valid: false, error: `File size exceeds 2MB limit (got ${(fileSize / 1024 / 1024).toFixed(2)}MB)` };
    return { valid: true };
  }
}
