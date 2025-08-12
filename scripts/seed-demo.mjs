import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ulid } from 'ulid';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(d) { return new Date(d).toISOString(); }

const shipId = ulid();
const sailingId = ulid();

const venues = [
  { id: ulid(), shipId, type: 'restaurant', name: 'Aurora', deck: 7 },
  { id: ulid(), shipId, type: 'restaurant', name: 'Celeste', deck: 8 },
  { id: ulid(), shipId, type: 'restaurant', name: 'Luna Buffet', deck: 14 },
  { id: ulid(), shipId, type: 'theater', name: 'Orion Theater', deck: 5 },
  { id: ulid(), shipId, type: 'spa', name: 'Zen Spa', deck: 12 },
  { id: ulid(), shipId, type: 'activity', name: 'Constellation Hall', deck: 6 },
];

const ship = { id: shipId, name: 'MV Horizon', code: 'HZN', decks: 14, venues };

const startDate = new Date();
startDate.setHours(12, 0, 0, 0);
const endDate = addDays(startDate, 7);

const itineraryDays = [
  { dayNumber: 1, date: iso(startDate), portName: 'Miami' },
  { dayNumber: 2, date: iso(addDays(startDate, 1)), portName: 'Sea Day' },
  { dayNumber: 3, date: iso(addDays(startDate, 2)), portName: 'Cozumel' },
  { dayNumber: 4, date: iso(addDays(startDate, 3)), portName: 'Sea Day' },
  { dayNumber: 5, date: iso(addDays(startDate, 4)), portName: 'Grand Cayman' },
  { dayNumber: 6, date: iso(addDays(startDate, 5)), portName: 'Sea Day' },
  { dayNumber: 7, date: iso(addDays(startDate, 6)), portName: 'Miami' },
];

const sailing = { id: sailingId, shipId, startDate: iso(startDate), endDate: iso(endDate), itineraryDays };

const cabins = [];
const categories = ['Inside', 'Oceanview', 'Balcony'];
for (let i = 0; i < 30; i++) {
  const deck = 6 + Math.floor(i / 6);
  const number = `${deck}0${10 + i}`;
  cabins.push({ id: ulid(), shipId, number, deck, category: categories[i % categories.length], maxOccupancy: 2 + (i % 3) });
}

// Special cabins
const captainsCabin = { id: ulid(), shipId, number: 'Captains Quarters', deck: 12, category: 'Suite', maxOccupancy: 2 };
const crewCabin = { id: ulid(), shipId, number: 'Crew Quarters', deck: 2, category: 'Crew', maxOccupancy: 4 };
cabins.push(captainsCabin, crewCabin);

const guests = [];
const assignments = [];
const users = [];

function newGuest(idx, cabin) {
  const id = ulid();
  const email = `guest${String(idx).padStart(2, '0')}@example.com`;
  const firstName = `Guest${idx}`;
  const lastName = 'Demo';
  const dateOfBirth = iso('1990-01-01');
  const guest = { id, email, firstName, lastName, dateOfBirth };
  guests.push(guest);
  users.push({ id: ulid(), email, role: 'guest', guestId: id });
  assignments.push({ id: ulid(), sailingId, cabinId: cabin.id, guestId: id, checkInDate: sailing.startDate, checkOutDate: sailing.endDate, primaryGuest: false });
  return guest;
}

// Assign regular guests only to regular cabins (exclude special Suite/Crew)
const regularCabins = cabins.filter(c => c.category !== 'Suite' && c.category !== 'Crew');
for (let i = 0; i < regularCabins.length; i++) {
  const cabin = regularCabins[i];
  const g1 = newGuest(i * 2 + 1, cabin);
  const g2 = newGuest(i * 2 + 2, cabin);
  assignments[assignments.length - 2].primaryGuest = true;
}

// Demo named users
const alice = guests[0];
users.push({ id: ulid(), email: 'alice@example.com', role: 'guest', guestId: alice.id });
const bob = guests[1];
users.push({ id: ulid(), email: 'bob@example.com', role: 'guest', guestId: bob.id });
const carla = guests[2];
users.push({ id: ulid(), email: 'carla@example.com', role: 'guest', guestId: carla.id });

// Create Guest records for crew/admin and map UserAccount to them
const crewGuest = { id: ulid(), email: 'crew@example.com', firstName: 'Crew', lastName: 'Member', dateOfBirth: iso('1985-01-01') };
const adminGuest = { id: ulid(), email: 'admin@example.com', firstName: 'Captain', lastName: 'Admin', dateOfBirth: iso('1975-01-01') };
guests.push(crewGuest, adminGuest);
users.push({ id: ulid(), email: 'crew@example.com', role: 'crew', guestId: crewGuest.id });
users.push({ id: ulid(), email: 'admin@example.com', role: 'admin', guestId: adminGuest.id });

const delegations = [
  { id: ulid(), granterGuestId: alice.id, granteeGuestId: bob.id, scope: 'MANAGE', cabinId: assignments.find(a=>a.guestId===alice.id).cabinId, sailingId, expiresAt: null },
];

const products = [
  { id: ulid(), type: 'dining', venueId: venues[0].id, title: 'Aurora', description: 'A la carte', rules: { windowStartDaysBefore: 10, perGuestLimit: 1, cancellableUntilHoursBefore: 2 } },
  { id: ulid(), type: 'dining', venueId: venues[1].id, title: 'Celeste', description: 'Steakhouse', rules: { windowStartDaysBefore: 10, perGuestLimit: 1 } },
  { id: ulid(), type: 'dining', venueId: venues[2].id, title: 'Luna Buffet', description: 'Casual', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'show', venueId: venues[3].id, title: 'Starry Night Revue', description: 'Evening show', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'show', venueId: venues[3].id, title: "Captain's Gala", description: 'Formal night', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'excursion', title: 'Cozumel Reef Snorkel', description: 'Half-day snorkel', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'excursion', title: 'Grand Cayman Stingray City', description: 'Boat tour', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'spa', venueId: venues[4].id, title: 'Zen Spa Massage', description: '50-minute Swedish massage', rules: { windowStartDaysBefore: 5, cancellableUntilHoursBefore: 4 } },
  { id: ulid(), type: 'spa', venueId: venues[4].id, title: 'Thermal Suite Access', description: 'Day pass to thermal suite', rules: { windowStartDaysBefore: 5 } },
  { id: ulid(), type: 'activity', venueId: venues[5].id, title: 'Trivia Night', description: 'Team trivia contest', rules: { windowStartDaysBefore: 0 } },
  { id: ulid(), type: 'activity', venueId: venues[5].id, title: 'Salsa Dance Class', description: 'Beginner dance class', rules: { windowStartDaysBefore: 0 } },
];

const timeslots = [];
for (const p of products) {
  for (const day of itineraryDays) {
    if (p.type === 'excursion') {
      // Excursions only on their specific port days
      const port = p.title.includes('Cozumel') ? 'Cozumel' : p.title.includes('Grand Cayman') ? 'Grand Cayman' : null;
      if (!port || day.portName !== port) continue;
    }
    const start = new Date(day.date);
    start.setHours(p.type === 'activity' ? 10 : p.type === 'spa' ? 14 : 18, 0, 0, 0);
    const end = new Date(day.date);
    end.setHours((p.type === 'activity' ? 11 : p.type === 'spa' ? 15 : 20), 0, 0, 0);
    const capacity = p.type === 'show' ? 200 : p.type === 'dining' ? 40 : p.type === 'activity' ? 50 : p.type === 'spa' ? 12 : 25;
    timeslots.push({ id: ulid(), productId: p.id, sailingId, itineraryDayNumber: day.dayNumber, start: iso(start), end: iso(end), capacity });
  }
}

const bookings = [];
const payments = [];

// Assign crew/admin to their special cabins
assignments.push({ id: ulid(), sailingId, cabinId: captainsCabin.id, guestId: adminGuest.id, checkInDate: sailing.startDate, checkOutDate: sailing.endDate, primaryGuest: true });
assignments.push({ id: ulid(), sailingId, cabinId: crewCabin.id, guestId: crewGuest.id, checkInDate: sailing.startDate, checkOutDate: sailing.endDate, primaryGuest: true });

// pre-seed a couple of bookings
const slot0 = timeslots[0];
const b0 = { id: ulid(), guestId: alice.id, sailingId, cabinId: assignments.find(a=>a.guestId===alice.id).cabinId, status: 'confirmed', createdAt: iso(new Date()), items: [{ id: ulid(), bookingId: 'temp', productId: slot0.productId, timeslotId: slot0.id, quantity: 2, unitPriceCents: 0 }], totalCents: 0 };
b0.items[0].bookingId = b0.id;
bookings.push(b0);
payments.push({ id: ulid(), bookingId: b0.id, amountCents: 0, method: 'demo', status: 'captured', createdAt: iso(new Date()) });

const db = { ships: [ship], sailings: [sailing], cabins, guests, assignments, delegations, venues, products, timeslots, bookings, payments, users };

if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
await writeFile(DB_FILE, JSON.stringify(db, null, 2));
console.log('Demo DB written to', DB_FILE);
console.log('\nDemo users:');
console.log('- alice@example.com');
console.log('- bob@example.com');
console.log('- carla@example.com');
console.log('- crew@example.com');
console.log('- admin@example.com');
console.log('\nNext steps:');
console.log('1) Run: pnpm dev');
console.log('2) Open: http://localhost:3000');
console.log('3) Use /api/docs for OpenAPI JSON');

