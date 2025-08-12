import { auth } from "@/lib/auth/auth";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  const role = (session as unknown as { user?: { role?: string } })?.user?.role;
  if (!session || (role !== 'admin' && role !== 'crew')) {
    return NextResponse.json({ title: 'Forbidden' }, { status: 403 });
  }
  const repo = getRepo();
  const users = await repo.getUsers();
  const sailings = await repo.getSailings();
  const current = sailings[0];
  let assignments: Array<{ guestId: string; cabinId: string }> = [];
  let cabins: Array<{ id: string; number: string; deck: number }> = [];
  if (current) {
    assignments = await repo.getCabinAssignmentsBySailing(current.id);
    cabins = await repo.getCabinsBySailing(current.id);
  }
  const cabinById = new Map(cabins.map((c) => [c.id, c]));
  const assignmentByGuest = new Map(assignments.map((a) => [a.guestId, a]));
  const enriched = users.map((u) => {
    const asn = u.guestId ? assignmentByGuest.get(u.guestId) : null;
    const cabin = asn ? cabinById.get(asn.cabinId) : null;
    return { ...u, cabinId: cabin?.id || null, cabinNumber: cabin?.number || null, cabinDeck: cabin?.deck || null };
  });
  return NextResponse.json(enriched);
}

