"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MyCabinPage() {
  return (
    <Providers>
      <MyCabinInner />
    </Providers>
  );
}

function MyCabinInner() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api<any>("/api/me") });
  const asn = me?.assignment;
  const cabinId = asn?.cabinId as string | undefined;
  const { data: cabinList } = useQuery({
    queryKey: ["cabins", me?.currentSailing?.id],
    queryFn: async () => {
      if (!me?.currentSailing?.id) return [] as any[];
      return api<any[]>(`/api/cabins?sailingId=${me.currentSailing.id}`);
    },
    enabled: !!me?.currentSailing?.id,
  });
  const thisCabin = cabinList?.find((c: any) => c.id === cabinId);
  const { data: cabinGuests } = useQuery({
    queryKey: ["cabinGuests", cabinId],
    queryFn: async () => {
      if (!cabinId) return { guests: [] } as any;
      return api<any>(`/api/cabins/${cabinId}/guests`);
    },
    enabled: !!cabinId,
  });
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">My Cabin</h1>
      {!asn ? (
        <div>No cabin assignment found for the current sailing.</div>
      ) : (
        <div className="border rounded p-3">
          <div className="font-medium">Cabin {thisCabin?.number || asn.cabinId} · Deck {thisCabin?.deck ?? '-'}</div>
          <div>Check-in: {new Date(asn.checkInDate).toDateString()}</div>
          <div>Check-out: {new Date(asn.checkOutDate).toDateString()}</div>
          <div>Primary guest: {asn.primaryGuest ? "Yes" : "No"}</div>
          <div className="mt-3">
            <div className="font-medium mb-1">Cabin mates</div>
            <ul className="list-disc pl-5">
              {(cabinGuests?.guests || []).filter((g: any) => g.id !== me?.guest?.id).map((g: any) => (
                <li key={g.id}>{g.firstName} {g.lastName} ({g.email})</li>
              ))}
              {!cabinGuests?.guests?.length && <li>No other guests listed.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

