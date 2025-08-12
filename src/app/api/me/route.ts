import { auth } from "@/lib/auth/auth";
import { resolveEffectiveAccess } from "@/lib/authz/policy";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  const repo = getRepo();
  const email = session?.user?.email || undefined;
  const guestId = (session as unknown as { guestId?: string })?.guestId || undefined;
  const access = await resolveEffectiveAccess(repo, { email, guestId });
  let guest: { id?: string } | null = null;
  if (email) {
    guest = await repo.getGuestByEmail(email);
  }
  const sailings = await repo.getSailings();
  const currentSailing = sailings[0] || null;
  let assignment: any = null;
  if (guest?.id && currentSailing) {
    const asns = await repo.getCabinAssignmentsBySailing(currentSailing.id);
    assignment = asns.find((a) => a.guestId === guest.id) || null;
  }
  return NextResponse.json({ session, access, guest, currentSailing, assignment });
}

