"use client";
import Providers from "../../providers";
import GuestPicker from "./GuestPicker";
import BookSuccessModal from "./BookSuccessModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function ProductPage() {
  return (
    <Providers>
      <ProductInner />
    </Providers>
  );
}

function ProductInner() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api<any>("/api/me") });
  const { data: product } = useQuery({ queryKey: ["product", params.id], queryFn: () => api<any>(`/api/products/${params.id}`) });
  const sailingId = me?.currentSailing?.id;
  // Fetch cabin mates for selection
  const { data: asns } = useQuery({
    queryKey: ["asns", sailingId],
    queryFn: async () => {
      if (!sailingId || !me?.assignment?.cabinId) return [] as any[];
      const res = await fetch(`/api/cabins/${me.assignment.cabinId}/guests`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.guests as any[];
    },
    enabled: !!sailingId && !!me?.assignment?.cabinId,
  });
  const selectableGuests = (asns || []).filter((g:any) => !!g.id);
  const defaultGuestIds = me?.guest?.id ? [me.guest.id] : [];
  let selectedGuestIds = defaultGuestIds;
  const { data: slots } = useQuery({
    queryKey: ["timeslots", params.id, sailingId],
    queryFn: () => api<any[]>(`/api/products/${params.id}/timeslots?sailingId=${sailingId}`),
    enabled: !!sailingId,
  });

  const createBooking = useMutation({
    mutationFn: async ({ timeslotId, productId }: { timeslotId: string; productId: string }) => {
      if (!me?.guest?.id || !me?.currentSailing?.id || !me?.assignment?.cabinId) throw new Error('Missing profile context');
      const body = {
        guestId: me.guest.id,
        sailingId: me.currentSailing.id,
        cabinId: me.assignment.cabinId,
        items: [{ productId, timeslotId, quantity: selectedGuestIds.length || 1, unitPriceCents: 0 }],
        totalCents: 0,
        forGuestIds: selectedGuestIds.length ? selectedGuestIds : undefined,
      };
      const res = await fetch("/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 409) {
        const data = await res.json();
        return Promise.reject(data);
      }
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      const ts = (slots || []).find((s) => s.id === data.items?.[0]?.timeslotId) || null;
      const attendees = selectableGuests.filter((g:any) => (data.attendeeGuestIds || [me?.guest?.id]).includes(g.id)).length ? selectableGuests.filter((g:any) => (data.attendeeGuestIds || [me?.guest?.id]).includes(g.id)) : [me?.guest].filter(Boolean) as any[];
      setModal({ open: true, timeslot: ts, attendees });
    },
    onError: async (err: any, variables) => {
      if (err && err.conflicts && err.conflicts.length > 0) {
        const proceed = confirm(`Booking Conflict\n\n` + err.conflicts.map((c: any) => `- ${new Date(c.start).toLocaleString()} → ${new Date(c.end).toLocaleString()}`).join("\n") + `\n\nClick OK to cancel the conflicting booking(s) and proceed.`);
        if (!proceed) return;
        // Cancel all conflicting bookings then retry
        for (const c of err.conflicts) {
          await fetch(`/api/bookings/${c.bookingId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
        }
        // retry booking
        createBooking.mutate(variables);
      } else {
        const message = err?.detail || err?.title || (typeof err === 'string' ? err : 'Unknown error');
        alert(`Booking Error\n\n${message}`);
      }
    }
  });

  const [modal, setModal] = useState<{ open: boolean; timeslot: any; attendees: any[] }>({ open: false, timeslot: null, attendees: [] });
  return (
    <div className="space-y-4">
      {!product ? (
        <div>Loading...</div>
      ) : (
        <>
          <h1 className="text-xl font-semibold">{product.title}</h1>
          <div className="text-gray-600">{product.description}</div>
          <div className="space-y-3">
            <GuestPicker guests={selectableGuests} meGuestId={me?.guest?.id} onChange={(ids) => { selectedGuestIds = ids; }} />
            <h2 className="font-medium mb-2">Timeslots</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(slots || []).map((s) => (
                <div key={s.id} className="card p-3">
                  <div className="font-medium">{new Date(s.start).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Remaining: {s.remaining}</div>
                  <button className="mt-2 btn disabled:opacity-50" disabled={!me?.guest || s.remaining < 1}
                    onClick={() => createBooking.mutate({ timeslotId: s.id, productId: product.id })}>Book</button>
                </div>
              ))}
            </div>
          </div>
          <BookSuccessModal open={modal.open} onClose={() => setModal({ open: false, timeslot: null, attendees: [] })} product={product} timeslot={modal.timeslot} attendees={modal.attendees} />
        </>
      )}
    </div>
  );
}

