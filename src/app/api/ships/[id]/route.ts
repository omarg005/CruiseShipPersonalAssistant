import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: any) {
  const repo = getRepo();
  const id = context?.params?.id as string;
  const ship = await repo.getShipById(id);
  if (!ship) return NextResponse.json({ title: "Not Found" }, { status: 404 });
  return NextResponse.json(ship);
}

