import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(_: Request, context: any) {
  const repo = getRepo();
  const id = context?.params?.id as string;
  const product = await repo.getProductById(id);
  if (!product) return NextResponse.json({ title: "Not Found" }, { status: 404 });
  return NextResponse.json(product);
}

