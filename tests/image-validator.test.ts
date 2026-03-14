import { ImageValidator } from '../lib/image-validator';

describe('ImageValidator Unit Tests', () => {

  describe('validateFormat()', () => {

    it('accepts valid formats', () => {
      expect(ImageValidator.validateFormat('jpg')).toBe(true);
      expect(ImageValidator.validateFormat('png')).toBe(true);
      expect(ImageValidator.validateFormat('webp')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(ImageValidator.validateFormat('bmp')).toBe(false);
      expect(ImageValidator.validateFormat('svg')).toBe(false);
    });

  });

  describe('validateSize()', () => {

    it('accepts files under 2MB', () => {
      expect(
        ImageValidator.validateSize(1024 * 1024)
      ).toBe(true);
    });

    it('rejects files over 2MB', () => {
      expect(
        ImageValidator.validateSize(3 * 1024 * 1024)
      ).toBe(false);
    });

  });

  describe('validate()', () => {

    it('valid image passes validation', () => {

      const result =
        ImageValidator.validate(
          'test.jpg',
          100000,
          'jpg'
        );

      expect(result.valid).toBe(true);
    });

    it('invalid format fails', () => {

      const result =
        ImageValidator.validate(
          'test.bmp',
          100000,
          'bmp'
        );

      expect(result.valid).toBe(false);
    });

  });

});