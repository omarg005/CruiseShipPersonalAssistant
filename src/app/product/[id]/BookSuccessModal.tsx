"use client";
import { useEffect } from "react";

export default function BookSuccessModal({ open, onClose, product, timeslot, attendees }: { open: boolean; onClose: () => void; product: any; timeslot: any; attendees: any[] }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-2">Booking Confirmed</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div><span className="font-medium">Activity:</span> {product?.title}</div>
          <div><span className="font-medium">When:</span> {timeslot ? new Date(timeslot.start).toLocaleString() : '-'}</div>
          <div><span className="font-medium">Guests:</span></div>
          <ul className="list-disc pl-5">
            {attendees.map((g) => (
              <li key={g.id}>{g.firstName} {g.lastName} ({g.email})</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-black text-white">Close</button>
        </div>
      </div>
    </div>
  );
}

