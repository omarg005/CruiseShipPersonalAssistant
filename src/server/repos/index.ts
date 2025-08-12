import type { Booking, BookingItem, Cabin, CabinAssignment, Delegation, Guest, Product, Sailing, Ship, Timeslot, UserAccount, Venue } from "@/schemas/models";

export interface Repository {
  // reads
  getShips(): Promise<Ship[]>;
  getShipById(id: string): Promise<Ship | null>;
  getSailings(): Promise<Sailing[]>;
  getSailingById(id: string): Promise<Sailing | null>;
  getCabinsByShip(shipId: string): Promise<Cabin[]>;
  getCabinsBySailing(sailingId: string): Promise<Cabin[]>;
  getCabinById(id: string): Promise<Cabin | null>;
  getCabinAssignmentsBySailing(sailingId: string): Promise<CabinAssignment[]>;
  getGuestsByIds(ids: string[]): Promise<Guest[]>;
  getGuestByEmail(email: string): Promise<Guest | null>;
  getUserAccountByEmail(email: string): Promise<UserAccount | null>;
  getDelegationsForGuest(guestId: string): Promise<Delegation[]>;
  getProducts(filter?: { type?: string; venueId?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getTimeslotsByProduct(productId: string, opts: { sailingId: string; day?: number }): Promise<(Timeslot & { remaining: number })[]>;
  getTimeslotById(id: string): Promise<Timeslot | null>;
  getBookingsByGuest(guestId: string, sailingId?: string): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  getVenuesByShip(shipId: string): Promise<Venue[]>;
  getUsers(): Promise<UserAccount[]>;

  // writes
  createBooking(input: Omit<Booking, "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;
  createPayment(payment: { bookingId: string; amountCents: number; method: "demo"; status: "captured"; id?: string; createdAt?: string }): Promise<void>;
}

export type RepoFactory = () => Repository;

