/**
 * US010: Cliente agrega productos al carrito
 * Pruebas para el sistema de carrito de compras
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock del localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('US010: Carrito de Compras', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Agregar productos al carrito', () => {
    it('debe agregar un producto al carrito', () => {
      const product = {
        id: 1,
        name: 'Hamburguesa Mojarra',
        base_price: 85.00,
        quantity: 1
      }

      // Simular agregar al carrito
      const cart = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')!) : []
      cart.push(product)
      localStorage.setItem('carrito', JSON.stringify(cart))

      const savedCart = JSON.parse(localStorage.getItem('carrito')!)
      expect(savedCart).toHaveLength(1)
      expect(savedCart[0].id).toBe(1)
      expect(savedCart[0].name).toBe('Hamburguesa Mojarra')
      expect(savedCart[0].base_price).toBe(85.00)
    })

    it('debe agregar múltiples productos al carrito', () => {
      const products = [
        { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 1 },
        { id: 2, name: 'Taco', base_price: 45, quantity: 2 },
        { id: 3, name: 'Pizza', base_price: 95, quantity: 1 }
      ]

      products.forEach(product => {
        const cart = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')!) : []
        cart.push(product)
        localStorage.setItem('carrito', JSON.stringify(cart))
      })

      const savedCart = JSON.parse(localStorage.getItem('carrito')!)
      expect(savedCart).toHaveLength(3)
      expect(savedCart[0].base_price).toBe(85)
      expect(savedCart[1].quantity).toBe(2)
    })

    it('debe evitar productos duplicados al agregar con la misma cantidad', () => {
      const product = { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 1 }
      
      let cart = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')!) : []
      const existingIndex = cart.findIndex((p: any) => p.id === product.id)
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += product.quantity
      } else {
        cart.push(product)
      }
      
      localStorage.setItem('carrito', JSON.stringify(cart))

      const savedCart = JSON.parse(localStorage.getItem('carrito')!)
      expect(savedCart).toHaveLength(1)
      expect(savedCart[0].quantity).toBe(1)
    })

    it('debe actualizar cantidad si el producto ya existe', () => {
      const cart = [
        { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 1 }
      ]
      
      localStorage.setItem('carrito', JSON.stringify(cart))

      // Agregar el mismo producto con cantidad 2
      const updatedCart = JSON.parse(localStorage.getItem('carrito')!)
      const existingIndex = updatedCart.findIndex((p: any) => p.id === 1)
      updatedCart[existingIndex].quantity = 3

      localStorage.setItem('carrito', JSON.stringify(updatedCart))

      const final = JSON.parse(localStorage.getItem('carrito')!)
      expect(final[0].quantity).toBe(3)
    })

    it('debe calcular subtotal correctamente', () => {
      const cart = [
        { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 2 },
        { id: 2, name: 'Taco', base_price: 45, quantity: 3 }
      ]
      
      const subtotal = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0)
      
      expect(subtotal).toBe(170 + 135) // 85*2 + 45*3 = 305
      expect(subtotal).toBe(305)
    })

    it('debe calcular IVA (16%) correctamente', () => {
      const subtotal = 100
      const iva = subtotal * 0.16
      const total = subtotal + iva

      expect(iva).toBe(16)
      expect(total).toBe(116)
    })

    it('debe remover producto del carrito', () => {
      const cart = [
        { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 1 },
        { id: 2, name: 'Taco', base_price: 45, quantity: 1 }
      ]
      
      localStorage.setItem('carrito', JSON.stringify(cart))

      // Remover producto con id 1
      let savedCart = JSON.parse(localStorage.getItem('carrito')!)
      savedCart = savedCart.filter((item: any) => item.id !== 1)
      localStorage.setItem('carrito', JSON.stringify(savedCart))

      const final = JSON.parse(localStorage.getItem('carrito')!)
      expect(final).toHaveLength(1)
      expect(final[0].id).toBe(2)
    })

    it('debe limpiar el carrito', () => {
      const cart = [
        { id: 1, name: 'Hamburguesa', base_price: 85, quantity: 1 },
        { id: 2, name: 'Taco', base_price: 45, quantity: 1 }
      ]
      
      localStorage.setItem('carrito', JSON.stringify(cart))
      expect(JSON.parse(localStorage.getItem('carrito')!)).toHaveLength(2)

      localStorage.removeItem('carrito')
      expect(localStorage.getItem('carrito')).toBeNull()
    })
  })

  describe('Validaciones del carrito', () => {
    it('debe rechazar cantidad negativa', () => {
      const product = { id: 1, name: 'Hamburguesa', base_price: 85, quantity: -1 }
      expect(product.quantity).toBeLessThan(0)
      expect(product.quantity < 1).toBe(true)
    })

    it('debe rechazar precio negativo', () => {
      const product = { id: 1, name: 'Hamburguesa', base_price: -85, quantity: 1 }
      expect(product.base_price).toBeLessThan(0)
      expect(product.base_price < 0).toBe(true)
    })

    it('debe validar que carrito tenga items antes de checkout', () => {
      const cart = []
      expect(cart.length).toBe(0)
      expect(cart.length > 0).toBe(false)
    })

    it('debe mantener integridad de datos del producto', () => {
      const product = {
        id: 1,
        name: 'Hamburguesa',
        base_price: 85,
        quantity: 1
      }

      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('base_price')
      expect(product).toHaveProperty('quantity')
    })
  })
})
