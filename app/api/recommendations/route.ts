// app/api/recommendations/route.ts
import { NextResponse } from "next/server";
import { RecomendacionController } from "@/controllers/RecomendacionController";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const customerId = searchParams.get("customerId"); // 👈 Recibimos el ID enviado desde el frontend

    if (!restaurantId || !customerId) {
      return NextResponse.json(
        { error: "restaurantId and customerId are required" }, 
        { status: 400 }
      );
    }

    const controller = new RecomendacionController();
    
    // Ahora usamos el customerId real que vino en la URL
    const recommendations = await controller.getRecommendationsForUser(
      Number(customerId),
      Number(restaurantId)
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error en API de recomendaciones:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}