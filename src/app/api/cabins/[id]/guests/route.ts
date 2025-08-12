import { auth } from "@/lib/auth/auth";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ title: 'Unauthorized' }, { status: 401 });
  const role = (session as any)?.user?.role;
  const sessionGuestId = (session as unknown as { guestId?: string })?.guestId as string | undefined;

  const repo = getRepo();
  const sailings = await repo.getSailings();
  const sailing = sailings[0];
  if (!sailing) return NextResponse.json({ guests: [], assignments: [] });
  const assignments = await repo.getCabinAssignmentsBySailing(sailing.id);
  const inCabin = assignments.filter(a => a.cabinId === params.id);

  const isSelfInCabin = !!sessionGuestId && inCabin.some(a => a.guestId === sessionGuestId);
  if (!(role === 'admin' || role === 'crew' || isSelfInCabin)) {
    return NextResponse.json({ title: 'Forbidden' }, { status: 403 });
  }

  const guests = await repo.getGuestsByIds(inCabin.map(a => a.guestId));
  return NextResponse.json({ guests, assignments: inCabin });
}

