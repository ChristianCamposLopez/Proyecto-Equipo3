// services/ExportService.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  product_name: string;
  total_quantity_sold: number;
  position: number;
}

export interface ExportMetadata {
  restaurantName: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  topN: number;
  totalProducts: number;
}

export class ExportService {
  /**
   * Exporta los datos a Excel (XLSX)
   */
  static exportToExcel(data: ExportData[], metadata: ExportMetadata): void {
    // Preparar datos para Excel
    const excelData = [
      ['REPORTE DE PLATOS MÁS VENDIDOS'],
      [''],
      ['Restaurante:', metadata.restaurantName],
      ['Período:', `${metadata.startDate} - ${metadata.endDate}`],
      ['Fecha de generación:', metadata.generatedAt],
      ['Top N solicitado:', metadata.topN.toString()],
      ['Total de platos con ventas:', metadata.totalProducts.toString()],
      [''],
      ['#', 'Plato', 'Cantidad vendida']
    ];

    // Agregar datos de ranking
    data.forEach(item => {
      excelData.push([
        item.position.toString(),
        item.product_name,
        item.total_quantity_sold.toString()
      ]);
    });

    // Crear hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },  // Posición
      { wch: 40 }, // Plato
      { wch: 20 }  // Cantidad
    ];

    // Crear libro y descargar
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ranking de Ventas');
    
    // Generar nombre de archivo
    const fileName = `ranking_ventas_${metadata.restaurantName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Exporta los datos a PDF
   */
  static exportToPDF(data: ExportData[], metadata: ExportMetadata): void {
    // Crear documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurar fuente para título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Platos Más Vendidos', 14, 20);

    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const startY = 35;
    let currentY = startY;
    
    doc.text(`Restaurante: ${metadata.restaurantName}`, 14, currentY);
    currentY += 7;
    doc.text(`Período: ${metadata.startDate} - ${metadata.endDate}`, 14, currentY);
    currentY += 7;
    doc.text(`Fecha de generación: ${metadata.generatedAt}`, 14, currentY);
    currentY += 7;
    doc.text(`Top N solicitado: ${metadata.topN}`, 14, currentY);
    currentY += 7;
    doc.text(`Total de platos con ventas: ${metadata.totalProducts}`, 14, currentY);
    currentY += 10;

    // Preparar datos para la tabla
    const tableData = data.map(item => [
      item.position.toString(),
      item.product_name,
      item.total_quantity_sold.toString()
    ]);

    // Configurar tabla
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Plato', 'Cantidad vendida']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [193, 122, 58], // #C17A3A
        textColor: [17, 16, 16],   // #111010
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 120 },
        2: { halign: 'right', cellWidth: 40 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: 14, right: 14 }
    });

    // Agregar pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Generado el ${new Date().toLocaleString()} - Sistema de Gestión de Restaurantes`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Descargar PDF
    const fileName = `ranking_ventas_${metadata.restaurantName}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Exporta según el formato seleccionado
   */
  static export(data: ExportData[], metadata: ExportMetadata, format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.exportToPDF(data, metadata);
    } else if (format === 'excel') {
      this.exportToExcel(data, metadata);
    }
  }
}