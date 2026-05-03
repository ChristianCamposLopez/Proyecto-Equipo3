import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VentaDiaria } from '@/models/entities/ventasEntity';

export interface VentasExportData {
  fecha: string;
  total_ventas: number;
  numero_pedidos: number;
}

export interface VentasExportMetadata {
  restaurantName: string;
  fechaInicio: string;
  fechaFin: string;
  generatedAt: string;
  totalDias: number;
}

export class ExportacionService {
  static exportToExcel(
    data: VentasExportData[],
    metadata: VentasExportMetadata
  ): Buffer {
    const excelData: string[][] = [
      ['REPORTE DE VENTAS DIARIAS'],
      [''],
      ['Restaurante:', metadata.restaurantName],
      ['Período:', `${metadata.fechaInicio} - ${metadata.fechaFin}`],
      ['Fecha de generación:', metadata.generatedAt],
      ['Total de días con ventas:', metadata.totalDias.toString()],
      [''],
      ['Fecha', 'Pedidos', 'Total Ventas'],
    ];

    data.forEach((item) => {
      excelData.push([
        item.fecha,
        item.numero_pedidos.toString(),
        `$${item.total_ventas.toFixed(2)}`,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 15 }, // Pedidos
      { wch: 20 }, // Total
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Diarias');

    return Buffer.from(
      XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    );
  }

  static exportToPDF(
    data: VentasExportData[],
    metadata: VentasExportMetadata
  ): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Ventas Diarias', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let currentY = 35;

    doc.text(`Restaurante: ${metadata.restaurantName}`, 14, currentY);
    currentY += 7;
    doc.text(
      `Período: ${metadata.fechaInicio} - ${metadata.fechaFin}`,
      14,
      currentY
    );
    currentY += 7;
    doc.text(
      `Fecha de generación: ${metadata.generatedAt}`,
      14,
      currentY
    );
    currentY += 7;
    doc.text(`Total de días con ventas: ${metadata.totalDias}`, 14, currentY);
    currentY += 10;

    const tableData = data.map((item) => [
      item.fecha,
      item.numero_pedidos.toString(),
      `$${item.total_ventas.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha', 'Pedidos', 'Total Ventas']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [193, 122, 58],
        textColor: [17, 16, 16],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 60 },
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });

    // Pie de página
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

    return Buffer.from(doc.output('arraybuffer'));
  }

  static export(
    data: VentasExportData[],
    metadata: VentasExportMetadata,
    format: 'pdf' | 'excel'
  ): Buffer {
    if (format === 'pdf') {
      return this.exportToPDF(data, metadata);
    } else {
      return this.exportToExcel(data, metadata);
    }
  }
}