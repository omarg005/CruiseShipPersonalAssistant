"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DashboardPage() {
  return (
    <Providers>
      <DashboardInner />
    </Providers>
  );
}

function DashboardInner() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api<any>("/api/me") });
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: () => api<any[]>("/api/bookings") , enabled: !!me?.session?.user });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => api<any[]>("/api/catalog") });
  const timeslotIds = (bookings || []).flatMap((b:any) => b.items.map((i:any) => i.timeslotId));
  const timeslotLookupQuery = useQuery({
    queryKey: ['timeslotLookup', timeslotIds.join(',')],
    queryFn: async () => {
      if (!timeslotIds.length) return [] as any[];
      const res = await fetch(`/api/timeslots/lookup?ids=${encodeURIComponent(timeslotIds.join(','))}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!timeslotIds.length,
  });
  const timeslotById = new Map((timeslotLookupQuery.data || []).map((t:any) => [t.id, t]));
  const { data: cabinGuests } = useQuery({
    queryKey: ["cabinGuests", me?.assignment?.cabinId],
    queryFn: async () => {
      if (!me?.assignment?.cabinId) return { guests: [] } as any;
      return api<any>(`/api/cabins/${me.assignment.cabinId}/guests`);
    },
    enabled: !!me?.assignment?.cabinId,
  });
  const guestById = new Map([...(cabinGuests?.guests || []), me?.guest].filter(Boolean).map((g:any) => [g.id, g]));
  const productById = new Map((products || []).map((p:any) => [p.id, p]));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Welcome {me?.guest?.firstName || me?.session?.user?.email || "Guest"}</h1>
      <div>
        <h2 className="font-medium mb-2">Upcoming bookings</h2>
        {(bookings || []).length ? (
          <div className="space-y-2">
            {(bookings || []).map((b:any) => (
              <div key={b.id} className="card p-3">
                <div className="text-sm text-gray-600">{new Date(b.createdAt).toLocaleString()} · {b.status}</div>
                <ul className="list-disc pl-5">
                  {b.items.map((it:any, idx:number) => {
                    const prod = productById.get(it.productId);
                    const ts = timeslotById.get(it.timeslotId) as { start?: string } | undefined;
                    return (
                      <li key={it.id || `${b.id}-${it.timeslotId}-${idx}`}>
                        <span className="font-medium">{prod?.title || it.productId}</span> <span className="text-xs uppercase text-gray-500">[{prod?.type}]</span> — {ts?.start ? new Date(ts.start).toLocaleString() : it.timeslotId}
                      </li>
                    );
                  })}
                </ul>
                <div className="text-sm">
                  Attendees: {
                    (b.attendeeGuestIds && b.attendeeGuestIds.length ? b.attendeeGuestIds : [me?.guest?.id])
                      .map((gid:string) => guestById.get(gid)?.firstName ? `${guestById.get(gid).firstName} ${guestById.get(gid).lastName}` : gid)
                      .join(', ')
                  }
                </div>
                {b.status !== 'cancelled' && (
                  <div className="mt-2">
                    <button
                      className="btn"
                      onClick={async () => {
                        const ok = confirm('Cancel this booking?');
                        if (!ok) return;
                        const res = await fetch(`/api/bookings/${b.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
                        if (!res.ok) { alert('Failed to cancel'); return; }
                        location.reload();
                      }}
                    >Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>No bookings yet.</div>
        )}
      </div>
    </div>
  );
}

