"use client";
import Providers from "../providers";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function UsersPage() {
  return (
    <Providers>
      <UsersInner />
    </Providers>
  );
}

function UsersInner() {
  const { data, error } = useQuery({ queryKey: ["users"], queryFn: () => api<any[]>("/api/users") });
  if (error) return <div className="text-red-600">Forbidden. Sign in as crew/admin.</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <div className="overflow-auto">
        <table className="min-w-[800px] w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border">ID</th>
              <th className="text-left p-2 border">Email</th>
              <th className="text-left p-2 border">Role</th>
              <th className="text-left p-2 border">Guest ID</th>
              <th className="text-left p-2 border">Cabin</th>
              <th className="text-left p-2 border">Deck</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((u) => (
              <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border font-mono">{u.id}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border font-mono">{u.guestId || "-"}</td>
                <td className="p-2 border">{u.cabinNumber || '-'}</td>
                <td className="p-2 border">{u.cabinDeck || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

