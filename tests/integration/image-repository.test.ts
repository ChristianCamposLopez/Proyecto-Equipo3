import { ImageRepository } from '../../lib/image-repository';
import { db } from '../../config/db';

describe('ImageRepository Integration', () => {

  let insertedId: number;

  afterAll(async () => {
    await db.end();
  });

  it('should insert image', async () => {

    const result = await ImageRepository.save(
      1,                         // product_id
      '/uploads/test.jpg',       // image_path
      'test.jpg',                // ✅ file_name
      102400,                    // ✅ file_size
      'jpg',                     // ✅ format
      true                       // is_primary
    );

    expect(result).toBeDefined();
    expect(result.product_id).toBe(1);

    insertedId = result.id;
  });

  it('should find images by product', async () => {

    const images =
      await ImageRepository.findByProductId(1);

    expect(Array.isArray(images)).toBe(true);
  });

  it('should delete image physically', async () => {

    const success =
      await ImageRepository.delete(insertedId);

    expect(success).toBe(true);
  });

});