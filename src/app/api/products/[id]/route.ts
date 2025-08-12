import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const repo = getRepo();
  const product = await repo.getProductById(params.id);
  if (!product) return NextResponse.json({ title: "Not Found" }, { status: 404 });
  return NextResponse.json(product);
}

