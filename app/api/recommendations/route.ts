// app/api/recommendations/route.ts
import { NextResponse } from "next/server";
import { RecomendacionController } from "@/controllers/RecomendacionController";

// ⚠️ Simulación — reemplaza con tu auth real
async function getUserFromSession() {
  return { id: 1 }; // mock temporal
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromSession();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    const controller = new RecomendacionController();
    const recommendations = await controller.getRecommendationsForUser(
      user.id,
      Number(restaurantId)
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}