import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || undefined) as string | undefined;
    const venueId = (searchParams.get("venueId") || undefined) as string | undefined;
    const repo = getRepo();
    const products = await repo.getProducts({ type, venueId });
    return NextResponse.json(products);
  } catch (e: any) {
    console.error("/api/catalog error", e);
    return NextResponse.json({ title: "Internal Error", detail: e?.message || String(e) }, { status: 500 });
  }
}

