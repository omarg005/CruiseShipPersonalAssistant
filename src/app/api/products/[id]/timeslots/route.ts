import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const sailingId = searchParams.get("sailingId") || "";
  const day = searchParams.get("day") ? Number(searchParams.get("day")) : undefined;
  const repo = getRepo();
  const slots = await repo.getTimeslotsByProduct(params.id, { sailingId, day });
  return NextResponse.json(slots);
}

