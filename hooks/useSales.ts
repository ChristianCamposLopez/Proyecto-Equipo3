// hooks/useSales.ts
import { useEffect, useState } from "react";
import { Sale } from "@/models/entities/VentaEntity";

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const sampleSales: Sale[] = [
    { day: '2026-03-10', total_orders: 5, total_sales: 450.0, average_ticket: 90.0 },
    { day: '2026-03-11', total_orders: 3, total_sales: 240.0, average_ticket: 80.0 },
  ];

  useEffect(() => {
    fetch("/api/reports/daily-sales")
      .then((res) => res.json())
      .then((data: Sale[]) => {
        setSales(data.length ? data : sampleSales);
      })
      .catch(() => setSales(sampleSales))
      .finally(() => setLoading(false));
  }, []);

  return { sales, loading };
};
