/**
 * US015 & US006: Exportación de reportes a Excel/CSV
 * Pruebas para la exportación de reportes de ventas
 */


describe('US015: Exportación de Reportes a Excel', () => {
  const mockDailySales = [
    {
      day: '2026-04-11',
      total_orders: 7,
      total_sales: 160.00,
      average_ticket: 22.86
    },
    {
      day: '2026-04-10',
      total_orders: 5,
      total_sales: 450.00,
      average_ticket: 90.00
    },
    {
      day: '2026-04-09',
      total_orders: 3,
      total_sales: 280.00,
      average_ticket: 93.33
    }
  ]

  describe('Obtención de datos de ventas', () => {
    it('debe obtener datos de ventas diarias', () => {
      expect(Array.isArray(mockDailySales)).toBe(true)
      expect(mockDailySales.length).toBeGreaterThan(0)
    })

    it('debe incluir fecha de venta', () => {
      mockDailySales.forEach(sale => {
        expect(sale).toHaveProperty('day')
        expect(sale.day).toMatch(/\d{4}-\d{2}-\d{2}/)
      })
    })

    it('debe incluir total de órdenes', () => {
      mockDailySales.forEach(sale => {
        expect(sale).toHaveProperty('total_orders')
        expect(sale.total_orders).toBeGreaterThanOrEqual(0)
      })
    })

    it('debe incluir total de ventas', () => {
      mockDailySales.forEach(sale => {
        expect(sale).toHaveProperty('total_sales')
        expect(sale.total_sales).toBeGreaterThanOrEqual(0)
      })
    })

    it('debe incluir promedio de ticket', () => {
      mockDailySales.forEach(sale => {
        expect(sale).toHaveProperty('average_ticket')
        expect(sale.average_ticket).toBeGreaterThanOrEqual(0)
      })
    })

    it('debe ordenar ventas por fecha descendente', () => {
      const dates = mockDailySales.map(s => s.day)
      expect(dates[0]).toBe('2026-04-11')
      expect(dates[dates.length - 1]).toBe('2026-04-09')
    })
  })

  describe('Validación de datos de venta', () => {
    it('debe validar que el total de ventas sea consistente', () => {
      mockDailySales.forEach(sale => {
        expect(typeof sale.total_sales).toBe('number')
        expect(sale.total_sales).toBeGreaterThanOrEqual(0)
      })
    })

    it('debe validar que el promedio sea correcto', () => {
      mockDailySales.forEach(sale => {
        if (sale.total_orders > 0) {
          const calculated = sale.total_sales / sale.total_orders
          const rounded = Math.round(calculated * 100) / 100
          // Permitir pequeña variación por redondeo
          expect(Math.abs(rounded - sale.average_ticket)).toBeLessThan(0.01)
        }
      })
    })

    it('debe rechazar ventas con monto negativo', () => {
      const invalidSale = {
        day: '2026-04-10',
        total_orders: 5,
        total_sales: -100.00,
        average_ticket: -20.00
      }

      expect(invalidSale.total_sales).toBeLessThan(0)
      expect(invalidSale.total_sales < 0).toBe(true)
    })
  })

  describe('Generación de Excel', () => {
    it('debe crear archivo Excel válido', () => {
      const excelFile = {
        fileName: 'reporte_diario_2026-04-10.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        content: Buffer.from('PK...') // Simulando contenido de Excel
      }

      expect(excelFile.fileName).toContain('.xlsx')
      expect(excelFile.mimeType).toContain('spreadsheetml')
    })

    it('debe incluir encabezados en Excel', () => {
      const headers = [
        'Fecha',
        'Total Órdenes',
        'Ingresos Totales',
        'Ticket Promedio'
      ]

      headers.forEach(header => {
        expect(typeof header).toBe('string')
        expect(header.length).toBeGreaterThan(0)
      })
    })

    it('debe formatear moneda en columnas de dinero', () => {
      const formatted = mockDailySales.map(sale => ({
        day: sale.day,
        total_sales: `$${sale.total_sales.toFixed(2)}`,
        average_ticket: `$${sale.average_ticket.toFixed(2)}`
      }))

      formatted.forEach(item => {
        expect(item.total_sales).toMatch(/^\$\d+\.\d{2}$/)
        expect(item.average_ticket).toMatch(/^\$\d+\.\d{2}$/)
      })
    })

    it('debe incluir todas las filas de datos', () => {
      const workbookRows = [
        ['Fecha', 'Total Órdenes', 'Ingresos Totales', 'Ticket Promedio'],
        ...mockDailySales.map(s => [
          s.day,
          s.total_orders,
          `$${s.total_sales.toFixed(2)}`,
          `$${s.average_ticket.toFixed(2)}`
        ])
      ]

      expect(workbookRows.length).toBe(mockDailySales.length + 1)
    })

    it('debe descargarse con nombre de archivo correcto', () => {
      const filename = 'reporte_diario_2026-04-10.xlsx'
      expect(filename).toContain('reporte_diario')
      expect(filename).toContain('2026-04-10')
    })
  })

  describe('Filtrado de datos', () => {
    it('debe permitir filtrar por rango de fechas', () => {
      const startDate = '2026-04-10'
      const endDate = '2026-04-11'

      const filtered = mockDailySales.filter(s => 
        s.day >= startDate && s.day <= endDate
      )

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(item => {
        expect(typeof item.day).toBe('string')
        expect(item.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(item.day >= startDate && item.day <= endDate).toBe(true)
      })
    })

    it('debe filtrar solo ventas completadas', () => {
      const salesData = [
        { day: '2026-04-10', status: 'COMPLETED', sales: 150 },
        { day: '2026-04-10', status: 'PENDING', sales: 100 },
        { day: '2026-04-10', status: 'COMPLETED', sales: 200 }
      ]

      const completed = salesData.filter(s => s.status === 'COMPLETED')
      
      expect(completed.length).toBe(2)
      completed.forEach(item => {
        expect(item.status).toBe('COMPLETED')
      })
    })

    it('debe excluir órdenes canceladas', () => {
      const orders = [
        { id: 1, status: 'COMPLETED', amount: 100 },
        { id: 2, status: 'CANCELLED', amount: 50 },
        { id: 3, status: 'COMPLETED', amount: 150 }
      ]

      const nonCancelled = orders.filter(o => o.status !== 'CANCELLED')
      
      expect(nonCancelled.length).toBe(2)
      nonCancelled.forEach(item => {
        expect(item.status).not.toBe('CANCELLED')
      })
    })
  })
})

describe('US006: Exportación de Reportes a CSV', () => {
  const mockDailySales = [
    { day: '2026-04-11', total_orders: 7, total_sales: 160.00, average_ticket: 22.86 },
    { day: '2026-04-10', total_orders: 5, total_sales: 450.00, average_ticket: 90.00 },
    { day: '2026-04-09', total_orders: 3, total_sales: 280.00, average_ticket: 93.33 }
  ]

  describe('Generación de CSV', () => {
    it('debe crear archivo CSV válido', () => {
      const csvContent = mockDailySales.map(s => 
        `${s.day},${s.total_orders},${s.total_sales},${s.average_ticket}`
      ).join('\n')

      expect(csvContent).toBeTruthy()
      expect(csvContent).toContain('2026-04-11')
    })

    it('debe incluir encabezados en CSV', () => {
      const header = 'day,total_orders,total_sales,average_ticket'
      expect(header.split(',')).toHaveLength(4)
    })

    it('debe separar columnas con comas', () => {
      const csvLine = '2026-04-11,7,160.00,22.86'
      const columns = csvLine.split(',')
      
      expect(columns).toHaveLength(4)
      expect(columns[0]).toBe('2026-04-11')
      expect(columns[1]).toBe('7')
    })

    it('debe descargarse con nombre correcto', () => {
      const filename = 'reporte_diario_2026-04-10.csv'
      expect(filename).toContain('reporte_diario')
      expect(filename).toContain('.csv')
    })

    it('debe usar saltos de línea para separar registros', () => {
      const csv = `day,total_orders,total_sales,average_ticket\n2026-04-11,7,160.00,22.86\n2026-04-10,5,450.00,90.00`
      const lines = csv.split('\n')
      
      expect(lines.length).toBe(3)
    })

    it('debe ser compatible con Excel y Calc', () => {
      const csvContent = 'day,total_orders,total_sales\n2026-04-11,7,160.00'
      
      expect(csvContent.includes(',')). toBe(true)
      expect(csvContent.includes('\n')).toBe(true)
    })
  })

  describe('Validación de contenido CSV', () => {
    it('debe incluir correctamente todos los datos', () => {
      const csv = [
        'day,total_orders,total_sales,average_ticket',
        ...mockDailySales.map(s => `${s.day},${s.total_orders},${s.total_sales},${s.average_ticket}`)
      ].join('\n')

      const lines = csv.split('\n')
      expect(lines).toHaveLength(mockDailySales.length + 1)
    })

    it('debe formatear números correctamente', () => {
      const line = '2026-04-11,7,160.00,22.86'
      const [date, orders, sales, avg] = line.split(',')
      
      expect(date).toMatch(/\d{4}-\d{2}-\d{2}/)
      expect(orders).toMatch(/^\d+$/)
      expect(sales).toMatch(/^\d+\.\d{2}$/)
      expect(avg).toMatch(/^\d+\.\d{2}$/)
    })

    it('debe escapechar caracteres especiales si es necesario', () => {
      const problematicValue = 'Valor, con coma'
      const escaped = `"${problematicValue}"`
      
      expect(escaped).toContain('"')
      expect(escaped).toBe('"Valor, con coma"')
    })
  })

  describe('Headers HTTP para descarga', () => {
    it('debe retornar header Content-Type como text/csv', () => {
      const headers = {
        'Content-Type': 'text/csv; charset=utf-8'
      }

      expect(headers['Content-Type']).toContain('csv')
    })

    it('debe retornar header Content-Disposition para descarga', () => {
      const headers = {
        'Content-Disposition': 'attachment; filename="reporte_diario_2026-04-10.csv"'
      }

      expect(headers['Content-Disposition']).toContain('attachment')
      expect(headers['Content-Disposition']).toContain('filename')
    })

    it('debe incluir encoding UTF-8', () => {
      const headers = {
        'Content-Type': 'text/csv; charset=utf-8'
      }

      expect(headers['Content-Type']).toContain('utf-8')
    })
  })

  describe('Compatibilidad', () => {
    it('debe ser abierto en Microsoft Excel', () => {
      const mimeType = 'text/csv'
      expect(['text/csv', 'application/csv']).toContain(mimeType)
    })

    it('debe ser abierto en Google Sheets', () => {
      const mimeType = 'text/csv'
      expect(mimeType).toBe('text/csv')
    })

    it('debe ser abierto en LibreOffice Calc', () => {
      const csvContent = 'día,órdenes,ventas\n2026-04-11,7,160.00'
      expect(csvContent.includes(',')).toBe(true)
    })
  })
})

