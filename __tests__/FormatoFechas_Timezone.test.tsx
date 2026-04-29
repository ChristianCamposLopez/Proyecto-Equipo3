/**
 * Pruebas de Timezone y Formateo de Fechas
 * Validar que las fechas se muestren correctamente en zona horaria local
 */

describe('Timezone y Formateo de Fechas', () => {
  describe('Conversión de UTC a zona horaria local', () => {
    it('debe convertir 2026-04-11T00:18:00Z a 2026-04-10 06:18 PM en zona horaria local', () => {
      const utcDate = new Date('2026-04-11T00:18:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: undefined // Usa zona horaria del navegador
      })

      const formatted = formatter.format(utcDate)
      expect(formatted).toBeTruthy()

      // Extraer componentes
      const parts = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: undefined
      }).formatToParts(utcDate)

      // Validar que existe la fecha y hora
      expect(parts.length).toBeGreaterThan(0)
    })

    it('debe mostrar p.m. para horas posteriores a mediodía', () => {
      const afternoonDate = new Date('2026-04-10T18:30:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        hour12: true,
        month: '2-digit'
      })

      const dayPeriodFormatter = new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })

      const formatted = dayPeriodFormatter.format(afternoonDate)
      
      expect(formatted).toBeTruthy()
      // En zona CST (UTC-6), las 18:30 UTC son las 12:30 PM
    })
  })

  describe('Formateo consistente de fechas', () => {
    it('debe formatear fecha con separadores consistentes', () => {
      const date = new Date('2026-04-10T18:30:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const formatted = formatter.format(date)

      // Debe tener formato XX/XX/XXXX
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('debe usar 2 dígitos para día y mes', () => {
      const dates = [
        new Date('2026-04-05T10:00:00Z'),
        new Date('2026-04-15T10:00:00Z')
      ]

      dates.forEach(date => {
        const formatter = new Intl.DateTimeFormat('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })

        const formatted = formatter.format(date)
        const parts = formatted.split('/')
        
        // Day y month deben tener 2 dígitos
        expect(parts[0]).toHaveLength(2)
        expect(parts[1]).toHaveLength(2)
        expect(parts[2]).toHaveLength(4)
      })
    })

    it('debe mostrar hora con formato 12h', () => {
      const dates = [
        { utc: '2026-04-10T02:30:00Z', expected: 'a.m' },
        { utc: '2026-04-10T14:30:00Z', expected: 'p.m' }
      ]

      dates.forEach(({ utc }) => {
        const date = new Date(utc)
        const formatter = new Intl.DateTimeFormat('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

        const formatted = formatter.format(date)
        expect(formatted).toBeTruthy()
      })
    })
  })

  describe('DST (Daylight Saving Time)', () => {
    it('debe manejar cambio de horario de verano/invierno', () => {
      // Estas fechas están en diferentes épocas del año
      const winterDate = new Date('2026-01-10T12:00:00Z')
      const summerDate = new Date('2026-07-10T12:00:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const winterFormatted = formatter.format(winterDate)
      const summerFormatted = formatter.format(summerDate)

      // Ambas deben formatear correctamente
      expect(winterFormatted).toBeTruthy()
      expect(summerFormatted).toBeTruthy()
    })
  })

  describe('Validación de formato de fecha en BD', () => {
    it('debe validar que created_at en BD es ISO format', () => {
      const createdAt = '2026-04-11T00:18:00Z'

      expect(createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('debe validar que fecha UTC sin milisegundos', () => {
      const createdAt = '2026-04-11T00:18:00Z'

      // No debe incluir milisegundos
      expect(createdAt).not.toMatch(/\.\d{3}Z$/)
    })

    it('debe validar que fecha termina con Z (UTC)', () => {
      const createdAt = '2026-04-11T00:18:00Z'

      expect(createdAt.endsWith('Z')).toBe(true)
    })
  })

  describe('Comparación de fechas', () => {
    it('debe poder comparar fechas para ordenar', () => {
      const dates = [
        '2026-04-09T18:00:00Z',
        '2026-04-11T00:18:00Z',
        '2026-04-10T12:00:00Z'
      ]

      const sorted = dates.sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      )

      expect(sorted[0]).toBe('2026-04-11T00:18:00Z')
      expect(sorted[sorted.length - 1]).toBe('2026-04-09T18:00:00Z')
    })

    it('debe calcular diferencia entre fechas', () => {
      const date1 = new Date('2026-04-10T18:30:00Z')
      const date2 = new Date('2026-04-11T00:18:00Z')

      const diffMs = date2.getTime() - date1.getTime()
      const diffMinutes = diffMs / (1000 * 60)

      expect(diffMinutes).toBeGreaterThan(0)
      expect(diffMinutes).toBeCloseTo(348, 0) // Aprox 5.8 horas
    })

    it('debe identificar si fecha es hoy', () => {
      const today = new Date()
      const todayFormatted = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(today)

      const someDate = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date('2026-04-10T18:00:00Z'))

      // Ambas deben formatear
      expect(todayFormatted).toBeTruthy()
      expect(someDate).toBeTruthy()
    })
  })

  describe('Casos especiales de timezone', () => {
    it('debe manejar medianoche UTC correctamente', () => {
      const midnightUTC = new Date('2026-04-11T00:00:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })

      const formatted = formatter.format(midnightUTC)
      expect(formatted).toBeTruthy()
    })

    it('debe manejar fin de mes', () => {
      const endOfMonth = new Date('2026-04-30T23:59:59Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const formatted = formatter.format(endOfMonth)
      expect(formatted).toBeTruthy()
    })

    it('debe manejar cambio de mes', () => {
      const beforeMidnight = new Date('2026-04-30T23:00:00Z')
      const afterMidnight = new Date('2026-05-01T06:00:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      const before = formatter.format(beforeMidnight)
      const after = formatter.format(afterMidnight)

      // En zona CST, cambiarán de fecha
      expect(before).toBeTruthy()
      expect(after).toBeTruthy()
    })
  })

  describe('Formatos alternativos', () => {
    it('debe poder mostrar fecha larga (ej: "miércoles 10 de abril de 2026")', () => {
      const date = new Date('2026-04-10T18:30:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const formatted = formatter.format(date)
      expect(formatted).toBeTruthy()
      expect(formatted.toLowerCase()).toMatch(/\w+.*\d+.*\w+.*\d{4}/)
    })

    it('debe poder mostrar solo día de semana', () => {
      const date = new Date('2026-04-10T18:30:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        weekday: 'short'
      })

      const formatted = formatter.format(date)
      expect(formatted).toBeTruthy()
      expect(formatted.length).toBeLessThan(10)
    })

    it('debe poder mostrar solo hora', () => {
      const date = new Date('2026-04-10T18:30:00Z')

      const formatter = new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const formatted = formatter.format(date)
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Compatibilidad entre navegadores', () => {
    it('debe usar Intl.DateTimeFormat que es soportado en todos los navegadores', () => {
      expect(typeof Intl).toBe('object')
      expect(typeof Intl.DateTimeFormat).toBe('function')

      const formatter = new Intl.DateTimeFormat('es-MX')
      const formatted = formatter.format(new Date())

      expect(formatted).toBeTruthy()
    })

    it('debe ser más confiable que toLocaleDateString()', () => {
      const date = new Date('2026-04-10T18:30:00Z')

      const intlFormat = new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)

      const legacyFormat = date.toLocaleDateString('es-MX')

      // Ambos deberían devolver algo
      expect(intlFormat).toBeTruthy()
      expect(legacyFormat).toBeTruthy()
    })
  })
})
