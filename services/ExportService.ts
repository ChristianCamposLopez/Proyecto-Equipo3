// services/ExportService.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface RankingExportData {
  product_name: string;
  total_quantity_sold: number;
  position: number;
}

export interface VentasExportData {
  fecha: string;
  total_ventas: number;
  numero_pedidos: number;
}

export interface ExportMetadata {
  restaurantName: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  [key: string]: any;
}

export class ExportService {
  /**
   * Exportación de Ranking de Productos
   */
  static exportRanking(data: RankingExportData[], metadata: ExportMetadata, format: 'pdf' | 'excel'): Buffer | void {
    if (format === 'excel') {
        const excelData = [
            ['REPORTE DE PLATOS MÁS VENDIDOS'],
            [''],
            ['Restaurante:', metadata.restaurantName],
            ['Período:', `${metadata.startDate} - ${metadata.endDate}`],
            ['Fecha de generación:', metadata.generatedAt],
            [''],
            ['#', 'Plato', 'Cantidad vendida']
        ];
        data.forEach(item => excelData.push([item.position.toString(), item.product_name, item.total_quantity_sold.toString()]));
        
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 20 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ranking de Ventas');
        
        if (typeof window === 'undefined') {
            return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        } else {
            XLSX.writeFile(wb, `ranking_${metadata.restaurantName}.xlsx`);
        }
    } else {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Reporte de Platos Más Vendidos', 14, 20);
        doc.setFontSize(10);
        doc.text(`Restaurante: ${metadata.restaurantName}`, 14, 35);
        doc.text(`Período: ${metadata.startDate} - ${metadata.endDate}`, 14, 42);
        
        const tableData = data.map(item => [item.position.toString(), item.product_name, item.total_quantity_sold.toString()]);
        autoTable(doc, {
            startY: 50,
            head: [['#', 'Plato', 'Cantidad vendida']],
            body: tableData,
            theme: 'striped'
        });
        
        if (typeof window === 'undefined') {
            return Buffer.from(doc.output('arraybuffer'));
        } else {
            doc.save(`ranking_${metadata.restaurantName}.pdf`);
        }
    }
  }

  /**
   * Exportación de Ventas Diarias (Legacy ExportacionService)
   */
  static exportVentas(data: VentasExportData[], metadata: ExportMetadata, format: 'pdf' | 'excel'): Buffer | void {
    if (format === 'excel') {
        const excelData = [
            ['REPORTE DE VENTAS DIARIAS'],
            [''],
            ['Restaurante:', metadata.restaurantName],
            ['Período:', `${metadata.startDate} - ${metadata.endDate}`],
            ['Fecha de generación:', metadata.generatedAt],
            [''],
            ['Fecha', 'Pedidos', 'Total Ventas']
        ];
        data.forEach(item => excelData.push([item.fecha, item.numero_pedidos.toString(), `$${item.total_ventas.toFixed(2)}`]));
        
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 20 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas Diarias');
        
        if (typeof window === 'undefined') {
            return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        } else {
            XLSX.writeFile(wb, `ventas_${metadata.restaurantName}.xlsx`);
        }
    } else {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Reporte de Ventas Diarias', 14, 20);
        doc.setFontSize(10);
        doc.text(`Restaurante: ${metadata.restaurantName}`, 14, 35);
        
        const tableData = data.map(item => [item.fecha, item.numero_pedidos.toString(), `$${item.total_ventas.toFixed(2)}`]);
        autoTable(doc, {
            startY: 50,
            head: [['Fecha', 'Pedidos', 'Total Ventas']],
            body: tableData,
            theme: 'striped'
        });
        
        if (typeof window === 'undefined') {
            return Buffer.from(doc.output('arraybuffer'));
        } else {
            doc.save(`ventas_${metadata.restaurantName}.pdf`);
        }
    }
  }
}