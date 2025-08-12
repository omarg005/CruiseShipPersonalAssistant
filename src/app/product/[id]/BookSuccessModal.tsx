"use client";
import Modal from "@/components/Modal";

type Guest = { id: string; firstName?: string; lastName?: string; email?: string };

export default function BookSuccessModal({ open, onClose, product, timeslot, attendees }: { open: boolean; onClose: () => void; product: { title?: string; type?: string } | null; timeslot: { start?: string } | null; attendees: Guest[] }) {
  return (
    <Modal open={open} onClose={onClose} title="Booking Confirmed">
      <div className="text-sm text-gray-700 space-y-2">
        <div><span className="font-medium">Activity:</span> {product?.title} {product?.type ? <span className="text-xs uppercase text-gray-500">[{product.type}]</span> : null}</div>
        <div><span className="font-medium">When:</span> {timeslot?.start ? new Date(timeslot.start).toLocaleString() : '-'}</div>
        <div><span className="font-medium">Guests:</span></div>
        <ul className="list-disc pl-5">
          {attendees.map((g) => (
            <li key={g.id}>{[g.firstName, g.lastName].filter(Boolean).join(' ') || g.id} {g.email ? `(${g.email})` : ''}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded bg-black text-white">Close</button>
      </div>
    </Modal>
  );
}

