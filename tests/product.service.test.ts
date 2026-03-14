import { ProductService } from '../lib/product.service';
import { ProductRepository } from '../lib/repositories/product.repository';

jest.mock('../lib/repositories/product.repository');

describe('🧪 Pruebas Unitarias - ProductService', () => {

  let service: ProductService;
  let repositoryMock: jest.Mocked<ProductRepository>;

  beforeEach(() => {

    repositoryMock = new ProductRepository() as jest.Mocked<ProductRepository>;

    service = new ProductService();

    (service as any).repository = repositoryMock;

  });

  /*
  =====================================================
  US005.3 - Eliminación lógica de plato
  =====================================================
  */

  describe('US005.3 - Eliminar plato', () => {

    it('Debe eliminar lógicamente el producto cuando existe', async () => {

      repositoryMock.findById_2.mockResolvedValue({ id: 1 } as any);

      repositoryMock.logicalDelete = jest.fn().mockResolvedValue(true);

      await service.eliminarProduct(1);

      expect(repositoryMock.findById_2).toHaveBeenCalledWith(1);
      expect(repositoryMock.logicalDelete).toHaveBeenCalledWith(1);

    });

    it('Debe mostrar error cuando el producto no existe', async () => {

      repositoryMock.findById_2.mockResolvedValue(null);

      await expect(
        service.deactivateProduct(1)
      ).rejects.toThrow('Producto no encontrado');

    });

  });

  /*
  =====================================================
  US005.4 - Actualización de precio de plato
  =====================================================
  */

  describe('US005.4 - Actualizar precio', () => {

    it('Debe actualizar el precio cuando el producto existe', async () => {

      repositoryMock.findById_2.mockResolvedValue({ id: 1 } as any);

      repositoryMock.updatePrice.mockResolvedValue();

      await service.updatePrice(1, 15.99);

      expect(repositoryMock.findById_2).toHaveBeenCalledWith(1);
      expect(repositoryMock.updatePrice).toHaveBeenCalledWith(1, 15.99);

    });

    it('Debe lanzar error cuando el precio es menor o igual a 0', async () => {

      await expect(
        service.updatePrice(1, -5)
      ).rejects.toThrow('El precio debe ser mayor a 0');

    });

  });

  /*
  =====================================================
  US005.5 - Actualización de stock de plato
  =====================================================
  */

  describe('US005.5 - Actualizar stock', () => {

    it('Debe actualizar el stock correctamente', async () => {

      repositoryMock.findById_2.mockResolvedValue({ id: 1 } as any);

      repositoryMock.updateStock.mockResolvedValue();

      await service.updateStock(1, 25);

      expect(repositoryMock.findById_2).toHaveBeenCalledWith(1);
      expect(repositoryMock.updateStock).toHaveBeenCalledWith(1, 25);

    });

    it('Debe lanzar error cuando el stock es negativo', async () => {

      await expect(
        service.updateStock(1, -10)
      ).rejects.toThrow('El stock no puede ser negativo');

    });

  });

  /*
  =====================================================
  US005.6 - Activación de plato
  =====================================================
  */

  describe('US005.6 - Activar/desactivar plato', () => {

    it('Debe activar el producto correctamente', async () => {

      repositoryMock.findById_2.mockResolvedValue({ id: 1 } as any);

      repositoryMock.updateActiveStatus.mockResolvedValue(true);

      await service.activateProduct(1);

      expect(repositoryMock.findById_2).toHaveBeenCalledWith(1);
      expect(repositoryMock.updateActiveStatus).toHaveBeenCalledWith(1, true);

    });

  });

  /*
  =====================================================
  Validaciones internas del servicio
  =====================================================
  */

  describe('Validaciones internas del servicio', () => {

    it('validatePrice debe retornar TRUE cuando el precio es válido', () => {

      expect(service.validatePrice(20)).toBe(true);

    });

    it('validatePrice debe retornar FALSE cuando el precio es inválido', () => {

      expect(service.validatePrice(-10)).toBe(false);

    });

    it('validateStock debe retornar TRUE cuando el stock es válido', () => {

      expect(service.validateStock(5)).toBe(true);

    });

    it('validateStock debe retornar FALSE cuando el stock es inválido', () => {

      expect(service.validateStock(-3)).toBe(false);

    });

  });

});