// src/app/api/availability/route.ts
import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/services/availability.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(date, serviceId);
    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}