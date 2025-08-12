"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CabinsPage() {
  return (
    <Providers>
      <CabinsInner />
    </Providers>
  );
}

function CabinsInner() {
  const { data: ships } = useQuery({ queryKey: ['ships'], queryFn: () => api<any[]>('/api/ships') });
  const shipId = ships?.[0]?.id;
  const { data: cabins } = useQuery({ queryKey: ['cabins', shipId], queryFn: () => api<any[]>(`/api/cabins?shipId=${shipId}`), enabled: !!shipId });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cabins</h1>
      {!cabins ? (
        <div>Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cabins.map((c) => (
            <a key={c.id} href={`/cabins/${c.id}`} className="border rounded p-3 hover:bg-gray-50 block">
              <div className="font-medium">Cabin {c.number}</div>
              <div className="text-sm text-gray-600">Deck {c.deck} · {c.category} · Max {c.maxOccupancy}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

