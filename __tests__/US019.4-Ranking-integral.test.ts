import { ExportService, ExportData, ExportMetadata } from '@/services/ExportService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// Mock de XLSX con aoa_to_sheet que devuelve un objeto modificable
jest.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: jest.fn(() => ({})), // ✅ Devuelve objeto vacío para poder asignar !cols
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

jest.mock('jspdf', () => {
  const mJsPDF = {
    setFontSize: jest.fn().mockReturnThis(),
    setFont: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    getNumberOfPages: jest.fn().mockReturnValue(1),
    setPage: jest.fn().mockReturnThis(),
    setTextColor: jest.fn().mockReturnThis(),
    internal: { pageSize: { height: 297 } },
  };
  return jest.fn(() => mJsPDF);
});

jest.mock('jspdf-autotable', () => jest.fn());

describe('US019.4 – Exportar ranking a PDF o Excel', () => {
  const mockData: ExportData[] = [
    { position: 1, product_name: 'Tacos al pastor', total_quantity_sold: 120 },
    { position: 2, product_name: 'Quesadillas', total_quantity_sold: 95 },
  ];
  const mockMetadata: ExportMetadata = {
    restaurantName: 'Taquería El Buen Sabor',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    generatedAt: '2024-02-01 10:00:00',
    topN: 5,
    totalProducts: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Exportación a Excel', () => {
    it('debe llamar a XLSX.writeFile con el nombre de archivo correcto', () => {
      ExportService.exportToExcel(mockData, mockMetadata);
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/ranking_ventas_Taquería El Buen Sabor_\d{4}-\d{2}-\d{2}\.xlsx/)
      );
    });

    it('debe construir la hoja con encabezados y metadatos', () => {
      ExportService.exportToExcel(mockData, mockMetadata);
      const callArg = (XLSX.utils.aoa_to_sheet as jest.Mock).mock.calls[0][0];
      expect(callArg[0][0]).toBe('REPORTE DE PLATOS MÁS VENDIDOS');
      expect(callArg[2]).toEqual(['Restaurante:', 'Taquería El Buen Sabor']);
      expect(callArg[8]).toEqual(['#', 'Plato', 'Cantidad vendida']);
      expect(callArg[9]).toEqual(['1', 'Tacos al pastor', '120']);
    });
  });

  describe('Exportación a PDF', () => {
    it('debe crear un documento PDF y guardarlo', () => {
      ExportService.exportToPDF(mockData, mockMetadata);
      const doc = new jsPDF();
      expect(doc.setFontSize).toHaveBeenCalledWith(20);
      expect(doc.text).toHaveBeenCalledWith('Reporte de Platos Más Vendidos', 14, 20);
      expect(doc.save).toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/));
    });
  });

  describe('Método export según formato', () => {
    it('debe llamar a exportToExcel cuando format = "excel"', () => {
      const excelSpy = jest.spyOn(ExportService, 'exportToExcel').mockImplementation();
      ExportService.export(mockData, mockMetadata, 'excel');
      expect(excelSpy).toHaveBeenCalledWith(mockData, mockMetadata);
      excelSpy.mockRestore();
    });

    it('debe llamar a exportToPDF cuando format = "pdf"', () => {
      const pdfSpy = jest.spyOn(ExportService, 'exportToPDF').mockImplementation();
      ExportService.export(mockData, mockMetadata, 'pdf');
      expect(pdfSpy).toHaveBeenCalledWith(mockData, mockMetadata);
      pdfSpy.mockRestore();
    });
  });
});