"use client";
import { useEffect, useState } from "react";

export default function GuestPicker({ guests, meGuestId, onChange }: { guests: Array<any>; meGuestId?: string; onChange: (ids: string[]) => void }) {
  const initial = guests.length <= 1 && meGuestId ? [meGuestId] : [];
  const [selected, setSelected] = useState<string[]>(initial);

  useEffect(() => {
    onChange(selected.length ? selected : (meGuestId ? [meGuestId] : []));
  }, [selected, meGuestId, onChange]);

  if (!guests?.length || (guests.length === 1 && guests[0].id === meGuestId)) return null;

  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Who are you booking for?</div>
      <div className="space-y-2">
        {guests.map((g) => (
          <label key={g.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(g.id)}
              onChange={(e) => {
                setSelected((prev) => (e.target.checked ? [...prev, g.id] : prev.filter((x) => x !== g.id)));
              }}
            />
            <span>{g.firstName} {g.lastName} ({g.email})</span>
          </label>
        ))}
      </div>
    </div>
  );
}

