import { NextResponse } from "next/server";
import { getLocations } from "@/lib/data";

export async function GET() {
  const locations = await getLocations();
  return NextResponse.json(locations);
}
