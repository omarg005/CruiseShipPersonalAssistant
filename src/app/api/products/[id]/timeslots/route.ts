import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request, context: any) {
  const { searchParams } = new URL(req.url);
  const sailingId = searchParams.get("sailingId") || "";
  const day = searchParams.get("day") ? Number(searchParams.get("day")) : undefined;
  const repo = getRepo();
  const productId = context?.params?.id as string;
  const slots = await repo.getTimeslotsByProduct(productId, { sailingId, day });
  return NextResponse.json(slots);
}

