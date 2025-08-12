import { auth } from "@/lib/auth/auth";
import { assertCan, resolveEffectiveAccess } from "@/lib/authz/policy";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const repo = getRepo();
  const email = session?.user?.email || undefined;
  const guestId = (session as any)?.guestId || undefined;
  const access = await resolveEffectiveAccess(repo, { email, guestId });
  const booking = await repo.getBookingById(params.id);
  if (!booking) return NextResponse.json({ title: 'Not Found' }, { status: 404 });
  assertCan('cancel', 'booking', { ...access, targetGuestId: booking.guestId, targetSailingId: booking.sailingId, targetCabinId: booking.cabinId });
  const body = await req.json().catch(() => ({} as any));
  if (body?.status !== 'cancelled') return NextResponse.json({ title: 'Validation Error' }, { status: 400 });
  const updated = await repo.updateBooking(params.id, { status: 'cancelled' } as any);
  return NextResponse.json(updated);
}

