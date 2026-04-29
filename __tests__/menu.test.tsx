import 'react'
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MenuPage from '../app/menu/page';

// Mock fetch
global.fetch = jest.fn();

describe('MenuPage Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render menu header', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      expect(screen.getByText(/La Parrilla Mixteca/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => new Promise(() => {}))
        .mockImplementationOnce(() => new Promise(() => {}));

      render(<MenuPage />);

      expect(screen.getByText(/Cargando menú/i)).toBeInTheDocument();
    });

    it('should display sample data when API is empty', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('Ejemplo: Hamburguesa')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('API Integration', () => {
    it('should fetch products and categories', () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      expect(global.fetch).toHaveBeenCalledWith('/api/menu/products');
      expect(global.fetch).toHaveBeenCalledWith('/api/menu/categories');
    });

    it('should handle API product data', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos al Pastor',
          base_price: 45,
          is_available: true,
          image_url: null,
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('Tacos al Pastor')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Product Information', () => {
    it('should format price with 2 decimals', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35.5,
          is_available: true,
          image_url: null,
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('$35.50')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display currency MXN', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: true,
          image_url: null,
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('MXN')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show image when available', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: true,
          image_url: 'https://example.com/tacos.jpg',
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        const img = screen.getByAltText('Tacos') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toBe('https://example.com/tacos.jpg');
      }, { timeout: 3000 });
    });

    it('should show placeholder when no image', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: true,
          image_url: null,
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('Sin imagen')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Product Availability', () => {
    it('should show unavailable status', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: false,
          image_url: 'https://example.com/tacos.jpg',
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('No disponible')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should not show unavailable for available products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: true,
          image_url: 'https://example.com/tacos.jpg',
          category_name: 'Tacos',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.queryByText('No disponible')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Category Filtering', () => {
    it('should show categories when available', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [{ id: 1, name: 'Tacos' }] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('Todos')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Footer', () => {
    it('should show footer text', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText('Sistema de Pedidos')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display product count', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Tacos',
          base_price: 35,
          is_available: true,
          image_url: null,
          category_name: 'Tacos',
        },
        {
          id: 2,
          name: 'Hamburguesa',
          base_price: 85,
          is_available: true,
          image_url: null,
          category_name: 'Hamburguesas',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockProducts })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<MenuPage />);

      await waitFor(() => {
        expect(screen.getByText(/2 platillos/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});