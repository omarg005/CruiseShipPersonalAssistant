import { auth } from "@/lib/auth/auth";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await auth();
  const role = (session as unknown as { user?: { role?: string } })?.user?.role;
  const repo = getRepo();
  const { searchParams } = new URL(req.url);
  const sailingId = searchParams.get('sailingId');
  const shipId = searchParams.get('shipId');
  let cabins: unknown[] = [];
  if (sailingId) cabins = await repo.getCabinsBySailing(sailingId);
  else if (shipId) cabins = await repo.getCabinsByShip(shipId);
  else cabins = await repo.getCabinsByShip((await repo.getShips())[0].id);
  return NextResponse.json(cabins);
}

