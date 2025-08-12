import { z } from "zod";
import {
  BookingStatusEnum,
  DelegationScopeEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  ProductTypeEnum,
  RoleEnum,
  VenueTypeEnum,
} from "./enums";

export const IdSchema = z.string().min(10);

export const AuditLogSchema = z.object({
  id: IdSchema,
  actorGuestId: z.string().optional(),
  actorRole: RoleEnum,
  action: z.string(),
  entityType: z.string(),
  entityId: IdSchema,
  at: z.string(),
  meta: z.record(z.any()).optional(),
});

export const ItineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string(),
  portName: z.string(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  notes: z.string().optional(),
});

export const VenueSchema = z.object({
  id: IdSchema,
  shipId: IdSchema,
  type: VenueTypeEnum,
  name: z.string(),
  deck: z.number().int().nonnegative(),
  description: z.string().optional(),
});

export const ShipSchema = z.object({
  id: IdSchema,
  name: z.string(),
  code: z.string(),
  decks: z.number().int().positive(),
  venues: z.array(VenueSchema),
});

export const SailingSchema = z.object({
  id: IdSchema,
  shipId: IdSchema,
  startDate: z.string(),
  endDate: z.string(),
  itineraryDays: z.array(ItineraryDaySchema),
});

export const CabinSchema = z.object({
  id: IdSchema,
  shipId: IdSchema,
  number: z.string(),
  deck: z.number().int().positive(),
  category: z.string(),
  maxOccupancy: z.number().int().positive(),
});

export const GuestSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  loyaltyTier: z.string().optional(),
  photoUrl: z.string().url().optional(),
  phone: z.string().optional(),
});

export const CabinAssignmentSchema = z.object({
  id: IdSchema,
  sailingId: IdSchema,
  cabinId: IdSchema,
  guestId: IdSchema,
  checkInDate: z.string(),
  checkOutDate: z.string(),
  primaryGuest: z.boolean(),
});

export const DelegationSchema = z.object({
  id: IdSchema,
  granterGuestId: IdSchema,
  granteeGuestId: IdSchema,
  scope: DelegationScopeEnum,
  cabinId: IdSchema.optional(),
  sailingId: IdSchema.optional(),
  expiresAt: z.string().optional(),
});

export const ProductRulesSchema = z.object({
  windowStartDaysBefore: z.number().int().nonnegative(),
  perGuestLimit: z.number().int().positive().optional(),
  cancellableUntilHoursBefore: z.number().int().nonnegative().optional(),
});

export const ProductSchema = z.object({
  id: IdSchema,
  type: ProductTypeEnum,
  venueId: IdSchema.optional(),
  title: z.string(),
  description: z.string(),
  rules: ProductRulesSchema,
});

export const TimeslotSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  sailingId: IdSchema,
  itineraryDayNumber: z.number().int().positive(),
  start: z.string(),
  end: z.string(),
  capacity: z.number().int().nonnegative(),
});

export const BookingItemSchema = z.object({
  id: IdSchema,
  bookingId: IdSchema,
  productId: IdSchema,
  timeslotId: IdSchema,
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

export const BookingSchema = z.object({
  id: IdSchema,
  guestId: IdSchema,
  sailingId: IdSchema,
  cabinId: IdSchema,
  status: BookingStatusEnum,
  createdAt: z.string(),
  items: z.array(BookingItemSchema),
  totalCents: z.number().int().nonnegative(),
  attendeeGuestIds: z.array(IdSchema).optional(),
});

export const CreateBookingInputSchema = z.object({
  guestId: IdSchema,
  sailingId: IdSchema,
  cabinId: IdSchema,
  items: z.array(z.object({
    productId: IdSchema,
    timeslotId: IdSchema,
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().nonnegative(),
  })),
  totalCents: z.number().int().nonnegative(),
  forGuestIds: z.array(IdSchema).optional(),
});

export const PaymentSchema = z.object({
  id: IdSchema,
  bookingId: IdSchema,
  amountCents: z.number().int().nonnegative(),
  method: PaymentMethodEnum,
  status: PaymentStatusEnum,
  createdAt: z.string(),
});

export const UserAccountSchema = z.object({
  id: IdSchema,
  email: z.string().email(),
  role: z.union([z.literal("guest"), z.literal("cabin-manager"), z.literal("crew"), z.literal("admin")]),
  guestId: IdSchema.optional(),
});

export type Ship = z.infer<typeof ShipSchema>;
export type Sailing = z.infer<typeof SailingSchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type Cabin = z.infer<typeof CabinSchema>;
export type Guest = z.infer<typeof GuestSchema>;
export type CabinAssignment = z.infer<typeof CabinAssignmentSchema>;
export type Delegation = z.infer<typeof DelegationSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Timeslot = z.infer<typeof TimeslotSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type BookingItem = z.infer<typeof BookingItemSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type UserAccount = z.infer<typeof UserAccountSchema>;

