import { z } from "zod";

export const RoleEnum = z.enum(["guest", "cabin-manager", "crew", "admin"]);
export type Role = z.infer<typeof RoleEnum>;

export const VenueTypeEnum = z.enum([
  "restaurant",
  "theater",
  "spa",
  "activity",
]);
export type VenueType = z.infer<typeof VenueTypeEnum>;

export const ProductTypeEnum = z.enum([
  "dining",
  "show",
  "excursion",
  "spa",
  "activity",
]);
export type ProductType = z.infer<typeof ProductTypeEnum>;

export const BookingStatusEnum = z.enum([
  "held",
  "confirmed",
  "cancelled",
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const PaymentMethodEnum = z.enum(["demo"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const PaymentStatusEnum = z.enum([
  "authorized",
  "captured",
  "voided",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const DelegationScopeEnum = z.enum(["VIEW", "BOOK", "MANAGE"]);
export type DelegationScope = z.infer<typeof DelegationScopeEnum>;

