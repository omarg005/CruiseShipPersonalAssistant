"use client";
import Providers from "../../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function CabinDetailPage() {
  return (
    <Providers>
      <CabinInner />
    </Providers>
  );
}

function CabinInner() {
  const params = useParams<{ id: string }>();
  const { data: shipList } = useQuery({ queryKey: ['ships'], queryFn: () => api<any[]>('/api/ships') });
  const shipId = shipList?.[0]?.id;
  const { data: cabin } = useQuery({ queryKey: ['cabin', params.id], queryFn: () => api<any>(`/api/cabins?shipId=${shipId}`).then(list => list.find((c:any)=>c.id===params.id)), enabled: !!shipId });
  const { data: data } = useQuery({ queryKey: ['cabinGuests', params.id], queryFn: () => api<any>(`/api/cabins/${params.id}/guests`) });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cabin {cabin?.number || params.id}</h1>
      <div className="text-sm text-gray-600">Deck {cabin?.deck} · {cabin?.category} · Max {cabin?.maxOccupancy}</div>
      <div>
        <h2 className="font-medium mb-2">Guests</h2>
        {!data ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-2">
            {data.guests.map((g: any) => (
              <li key={g.id} className="border rounded p-2">
                {g.firstName} {g.lastName} ({g.email})
              </li>
            ))}
            {!data.guests?.length && <li>No guests in this cabin.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

