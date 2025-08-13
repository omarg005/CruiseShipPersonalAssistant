"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ItineraryPage() {
  return (
    <Providers>
      <ItineraryInner />
    </Providers>
  );
}

function ItineraryInner() {
  const { data: sailings } = useQuery({ queryKey: ["sailings"], queryFn: () => api<any[]>("/api/sailings") });
  const sailing = (sailings || [])[0] as any;
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Itinerary</h1>
      {!sailing ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {sailing.itineraryDays.map((d: any) => (
            <li key={d.dayNumber} className="card p-3">
              <div className="font-medium">Day {d.dayNumber} · {new Date(d.date).toDateString()}</div>
              <div className="text-gray-600">{d.portName}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

