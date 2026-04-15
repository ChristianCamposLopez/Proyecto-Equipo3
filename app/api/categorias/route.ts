import { NextRequest, NextResponse } from "next/server";
import { CategoriaController } from "../../../controllers/CategoriaController";

const categoriaController = new CategoriaController();

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

    const result = await categoriaController.getCategoriesByRestaurant(
      Number(restaurantId)
    );

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("GET /api/categorias error", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}