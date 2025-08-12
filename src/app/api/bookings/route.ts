import { auth } from "@/lib/auth/auth";
import { assertCan, resolveEffectiveAccess } from "@/lib/authz/policy";
import { CreateBookingInputSchema } from "@/schemas/models";
import { getRepo } from "@/server/repos/factory";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  const repo = getRepo();
  const email = session?.user?.email || undefined;
  const guestId = (session as any)?.guestId || undefined;
  const access = await resolveEffectiveAccess(repo, { email, guestId });
  if (!guestId) return NextResponse.json({ title: "Unauthorized" }, { status: 401 });
  assertCan("read", "booking", { ...access, targetGuestId: guestId });
  const bookings = await repo.getBookingsByGuest(guestId);
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const repo = getRepo();
    const email = session?.user?.email || undefined;
    const guestId = (session as any)?.guestId || undefined;
    const access = await resolveEffectiveAccess(repo, { email, guestId });
    if (!guestId) return NextResponse.json({ title: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateBookingInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ title: "Validation Error", detail: parsed.error.format() }, { status: 400 });

    assertCan("create", "booking", { ...access, targetGuestId: parsed.data.guestId, targetSailingId: parsed.data.sailingId, targetCabinId: parsed.data.cabinId });

    // Prevent conflicts: same timeslot or overlapping timeslots
    const existing = await repo.getBookingsByGuest(parsed.data.guestId, parsed.data.sailingId);
    const requestedTimeslotIds = new Set(parsed.data.items.map((i) => i.timeslotId));
    const requestedSlots = [] as Array<{ id: string; productId: string; start: string; end: string }>;
    for (const item of parsed.data.items) {
      const ts = await repo.getTimeslotById(item.timeslotId);
      if (!ts) {
        return NextResponse.json({ title: "Invalid timeslot", detail: item.timeslotId }, { status: 400 });
      }
      requestedSlots.push({ id: item.timeslotId, productId: item.productId, start: ts.start, end: ts.end });
    }
    function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
      return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
    }
    const conflicts: Array<{ bookingId: string; timeslotId: string; start: string; end: string; productId: string }> = [];
    for (const b of existing) {
      if (b.status === "cancelled") continue;
      for (const i of b.items) {
        if (requestedTimeslotIds.has(i.timeslotId)) {
          // same timeslot
          const ts = await repo.getTimeslotById(i.timeslotId);
          if (ts) conflicts.push({ bookingId: b.id, timeslotId: i.timeslotId, start: ts.start, end: ts.end, productId: i.productId });
          continue;
        }
        const ts = await repo.getTimeslotById(i.timeslotId);
        if (!ts) continue;
        for (const r of requestedSlots) {
          if (overlaps(r.start, r.end, ts.start, ts.end)) {
            conflicts.push({ bookingId: b.id, timeslotId: i.timeslotId, start: ts.start, end: ts.end, productId: i.productId });
          }
        }
      }
    }
    if (conflicts.length > 0) {
      return NextResponse.json({ title: "Conflict", detail: "Overlapping existing booking(s)", conflicts }, { status: 409 });
    }

    // Capacity check: treat quantity as number of guests selected
    for (const item of parsed.data.items) {
      const slots = await repo.getTimeslotsByProduct(item.productId, { sailingId: parsed.data.sailingId });
      const slot = slots.find((s) => s.id === item.timeslotId);
      if (!slot || slot.remaining < item.quantity) {
        return NextResponse.json({ title: "Sold Out", detail: `Timeslot ${item.timeslotId} not available` }, { status: 409 });
      }
    }

    const booking = await repo.createBooking({
      id: undefined,
      guestId: parsed.data.guestId,
      sailingId: parsed.data.sailingId,
      cabinId: parsed.data.cabinId,
      status: "confirmed",
      createdAt: undefined,
      items: parsed.data.items as any,
      totalCents: parsed.data.totalCents,
      attendeeGuestIds: parsed.data.forGuestIds,
    } as any);

    // Demo payment: captured zero/amount
    await repo.createPayment({ bookingId: booking.id, amountCents: parsed.data.totalCents, method: "demo", status: "captured" });
    return NextResponse.json(booking, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/bookings error", e);
    return NextResponse.json({ title: "Internal Error", detail: e?.message || String(e) }, { status: 500 });
  }
}

