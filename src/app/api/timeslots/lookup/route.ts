import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids') || '';
  const ids = Array.from(new Set(idsParam.split(',').map((s) => s.trim()).filter(Boolean)));
  const repo = getRepo();
  const timeslots: Record<string, unknown>[] = [];
  for (const id of ids) {
    const ts = await repo.getTimeslotById(id);
    if (ts) timeslots.push(ts);
  }
  return NextResponse.json(timeslots);
}

