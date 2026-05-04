// app/api/categorias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CategoriaService } from "@/services/CategoriaService";

const categoriaService = new CategoriaService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId es requerido" },
        { status: 400 }
      );
    }

    const result = await categoriaService.getCategoriesByRestaurant(
      Number(restaurantId)
    );

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("❌ GET /api/categorias error", {
      message: err.message,
      stack: err.stack
    });
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}