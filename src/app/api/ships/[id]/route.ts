import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const repo = getRepo();
  const ship = await repo.getShipById(params.id);
  if (!ship) return NextResponse.json({ title: "Not Found" }, { status: 404 });
  return NextResponse.json(ship);
}

