import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const repo = getRepo();
  const ships = await repo.getShips();
  return NextResponse.json(ships);
}

