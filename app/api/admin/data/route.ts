import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getFleet, setFleet,
  getServices, setServices,
  getDestinations, setDestinations,
  getPricing, setPricing,
} from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";

async function authorized(): Promise<boolean> {
  return isAdminAuthenticated();
}

export async function GET(req: NextRequest) {
  if (!await authorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = req.nextUrl.searchParams.get("entity");

  switch (entity) {
    case "fleet":        return NextResponse.json(await getFleet());
    case "services":     return NextResponse.json(await getServices());
    case "destinations": return NextResponse.json(await getDestinations());
    case "pricing":      return NextResponse.json(await getPricing());
    default:             return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!await authorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entity = req.nextUrl.searchParams.get("entity");
  const data = await req.json();

  switch (entity) {
    case "fleet":        await setFleet(data);        break;
    case "services":     await setServices(data);     break;
    case "destinations": await setDestinations(data); break;
    case "pricing":      await setPricing(data);      break;
    default:             return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  // Revalidate public pages so changes appear immediately
  revalidatePath("/");
  revalidatePath("/booking");
  revalidatePath("/fleet");
  revalidatePath("/services");

  return NextResponse.json({ ok: true });
}
