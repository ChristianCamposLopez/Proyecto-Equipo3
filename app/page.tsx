"use client"
import { useEffect, useState } from "react"

export default function Home(){

  type Sale = {
    day: string;
    total_orders: number;
    total_sales: number;
    average_ticket: number;
  };

  const [sales,setSales] = useState<Sale[]>([])

  const sampleSales: Sale[] = [
    { day: '2026-03-10', total_orders: 5, total_sales: 450.0, average_ticket: 90.0 },
    { day: '2026-03-11', total_orders: 3, total_sales: 240.0, average_ticket: 80.0 },
  ];

  useEffect(()=>{

    fetch("/api/reports/daily-sales")
    .then(res=>res.json())
.then((data: Sale[])=>setSales(data.length ? data : sampleSales))

  },[])

  return(

    <div style={{padding:"40px"}}>

      <h1>Dashboard Ventas</h1>

      <a href="/api/reports/daily-sales/csv">
        Descargar CSV
      </a>

      <table border={1} cellPadding={10}>

        <thead>
          <tr>
            <th>Día</th>
            <th>Pedidos</th>
            <th>Total Ventas</th>
            <th>Promedio</th>
          </tr>
        </thead>

        <tbody>

          {sales.map((s)=> (
            <tr key={s.day}>
              <td>{s.day}</td>
              <td>{s.total_orders}</td>
              <td>${s.total_sales}</td>
              <td>${s.average_ticket}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )
}
