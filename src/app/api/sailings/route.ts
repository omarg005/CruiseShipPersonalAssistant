import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const repo = getRepo();
  const sailings = await repo.getSailings();
  return NextResponse.json(sailings);
}

