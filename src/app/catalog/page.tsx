"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

export default function CatalogPage() {
  return (
    <Providers>
      <CatalogInner />
    </Providers>
  );
}

const tabs = [
  { key: "dining", label: "Dining" },
  { key: "show", label: "Shows" },
  { key: "excursion", label: "Excursions" },
  { key: "spa", label: "Spa" },
  { key: "activity", label: "Activities" },
];

function CatalogInner() {
  const [type, setType] = useState<string | undefined>("dining");
  const { data: products, isLoading } = useQuery({ queryKey: ["catalog", type], queryFn: () => api<any[]>(`/api/catalog${type ? `?type=${type}` : ""}`) });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Catalog</h1>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t.key} className={`px-3 py-1 rounded border ${type===t.key?"bg-black text-white":""}`} onClick={() => setType(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(products || []).map((p) => (
            <a key={p.id} href={`/product/${p.id}`} className="border rounded p-3 hover:bg-gray-50">
              <div className="font-medium">{p.title}</div>
              <div className="text-gray-600 text-sm">{p.type}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

