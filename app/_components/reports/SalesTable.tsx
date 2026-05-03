// components/reports/SalesTable.tsx
import React from 'react';
import { Sale } from '@/models/entities/VentaEntity';

interface SalesTableProps {
  sales: Sale[];
}

export const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-6 py-4 font-semibold">Día</th>
            <th className="px-6 py-4 font-semibold">Pedidos</th>
            <th className="px-6 py-4 font-semibold">Total Ventas</th>
            <th className="px-6 py-4 font-semibold">Promedio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sales.map((s) => (
            <tr key={s.day} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
              <td className="px-6 py-4">{s.day}</td>
              <td className="px-6 py-4">{s.total_orders}</td>
              <td className="px-6 py-4">${s.total_sales.toFixed(2)}</td>
              <td className="px-6 py-4">${s.average_ticket.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
