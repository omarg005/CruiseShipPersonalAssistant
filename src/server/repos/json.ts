import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { ulid } from "ulid";
import type { Repository } from "./index";
import type { Booking, Cabin, CabinAssignment, Delegation, Guest, Product, Sailing, Ship, Timeslot, UserAccount, Venue } from "@/schemas/models";

type Db = {
  ships: Ship[];
  sailings: Sailing[];
  cabins: Cabin[];
  guests: Guest[];
  assignments: CabinAssignment[];
  delegations: Delegation[];
  venues: Venue[];
  products: Product[];
  timeslots: Timeslot[];
  bookings: Booking[];
  payments: { id: string; bookingId: string; amountCents: number; method: "demo"; status: "authorized" | "captured" | "voided"; createdAt: string }[];
  users: UserAccount[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let cachedDb: Db | null = null;
let cachedMtimeMs = 0;
async function loadDb(): Promise<Db> {
  if (!existsSync(DB_FILE)) {
    await mkdir(DATA_DIR, { recursive: true });
    const empty: Db = { ships: [], sailings: [], cabins: [], guests: [], assignments: [], delegations: [], venues: [], products: [], timeslots: [], bookings: [], payments: [], users: [] };
    await writeFile(DB_FILE, JSON.stringify(empty, null, 2));
    cachedDb = empty;
    cachedMtimeMs = Date.now();
    return empty;
  }
  const st = await stat(DB_FILE);
  if (cachedDb && st.mtimeMs === cachedMtimeMs) {
    return cachedDb;
  }
  const raw = await readFile(DB_FILE, "utf-8");
  cachedDb = JSON.parse(raw) as Db;
  cachedMtimeMs = st.mtimeMs;
  return cachedDb;
}

async function saveDb(db: Db): Promise<void> {
  await writeFile(DB_FILE, JSON.stringify(db, null, 2));
  cachedDb = db;
  const st = await stat(DB_FILE);
  cachedMtimeMs = st.mtimeMs;
}

export function createJsonRepo(): Repository {
  return {
    async getShips() {
      const db = await loadDb();
      return db.ships;
    },
    async getShipById(id) {
      const db = await loadDb();
      return db.ships.find((s) => s.id === id) ?? null;
    },
    async getSailings() {
      const db = await loadDb();
      return db.sailings;
    },
    async getSailingById(id) {
      const db = await loadDb();
      return db.sailings.find((s) => s.id === id) ?? null;
    },
    async getCabinsByShip(shipId) {
      const db = await loadDb();
      return db.cabins.filter((c) => c.shipId === shipId);
    },
    async getCabinsBySailing(sailingId) {
      const db = await loadDb();
      const sailing = db.sailings.find((s) => s.id === sailingId);
      if (!sailing) return [];
      return db.cabins.filter((c) => c.shipId === sailing.shipId);
    },
    async getCabinById(id) {
      const db = await loadDb();
      return db.cabins.find((c) => c.id === id) ?? null;
    },
    async getCabinAssignmentsBySailing(sailingId) {
      const db = await loadDb();
      return db.assignments.filter((a) => a.sailingId === sailingId);
    },
    async getGuestsByIds(ids) {
      const db = await loadDb();
      const idSet = new Set(ids);
      return db.guests.filter((g) => idSet.has(g.id));
    },
    async getGuestByEmail(email) {
      const db = await loadDb();
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user?.guestId) return null;
      return db.guests.find((g) => g.id === user.guestId) ?? null;
    },
    async getUserAccountByEmail(email) {
      const db = await loadDb();
      return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async getDelegationsForGuest(guestId) {
      const db = await loadDb();
      const nowIso = new Date().toISOString();
      return db.delegations.filter((d) => d.granteeGuestId === guestId && (!d.expiresAt || d.expiresAt > nowIso));
    },
    async getProducts(filter) {
      const db = await loadDb();
      let list = db.products;
      if (filter?.type) list = list.filter((p) => p.type === (filter.type as any));
      if (filter?.venueId) list = list.filter((p) => p.venueId === filter.venueId);
      return list;
    },
    async getProductById(id) {
      const db = await loadDb();
      return db.products.find((p) => p.id === id) ?? null;
    },
    async getTimeslotsByProduct(productId, opts) {
      const db = await loadDb();
      let slots = db.timeslots.filter((t) => t.productId === productId && t.sailingId === opts.sailingId);
      if (opts.day) slots = slots.filter((t) => t.itineraryDayNumber === opts.day);
      const remainingBySlot = new Map<string, number>();
      for (const slot of slots) {
        remainingBySlot.set(slot.id, slot.capacity);
      }
      for (const booking of db.bookings) {
        if (booking.sailingId !== opts.sailingId || booking.status === "cancelled") continue;
        for (const item of booking.items) {
          if (remainingBySlot.has(item.timeslotId)) {
            remainingBySlot.set(item.timeslotId, Math.max(0, (remainingBySlot.get(item.timeslotId) || 0) - item.quantity));
          }
        }
      }
      return slots.map((s) => ({ ...s, remaining: remainingBySlot.get(s.id) ?? s.capacity }));
    },
    async getTimeslotById(id) {
      const db = await loadDb();
      return db.timeslots.find((t) => t.id === id) ?? null;
    },
    async getBookingsByGuest(guestId, sailingId) {
      const db = await loadDb();
      return db.bookings.filter((b) => b.guestId === guestId && (!sailingId || b.sailingId === sailingId));
    },
    async getBookingById(id) {
      const db = await loadDb();
      return db.bookings.find((b) => b.id === id) ?? null;
    },
    async getVenuesByShip(shipId) {
      const db = await loadDb();
      return db.venues.filter((v) => v.shipId === shipId);
    },
    async getUsers() {
      const db = await loadDb();
      return db.users;
    },
    async createBooking(input) {
      const db = await loadDb();
      const id = input.id ?? ulid();
      const createdAt = input.createdAt ?? new Date().toISOString();
      const booking: Booking = { ...input, id, createdAt } as Booking;
      db.bookings.push(booking);
      await saveDb(db);
      return booking;
    },
    async updateBooking(id, data) {
      const db = await loadDb();
      const idx = db.bookings.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Booking not found");
      db.bookings[idx] = { ...db.bookings[idx], ...data };
      await saveDb(db);
      return db.bookings[idx];
    },
    async createPayment(payment) {
      const db = await loadDb();
      const id = payment.id ?? ulid();
      const createdAt = payment.createdAt ?? new Date().toISOString();
      db.payments.push({ ...payment, id, createdAt });
      const bookingIdx = db.bookings.findIndex((b) => b.id === payment.bookingId);
      if (bookingIdx !== -1) {
        // in demo, mark as confirmed if total is nonzero or keep confirmed
        db.bookings[bookingIdx].status = "confirmed";
      }
      await saveDb(db);
    },
  };
}

