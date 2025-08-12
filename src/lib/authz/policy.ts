import type { Repository } from "@/server/repos";

export type EffectiveAccess = {
  selfGuestIds: string[];
  cabinIdsManaged: string[];
  sailingIdsManaged: string[];
  role: "guest" | "cabin-manager" | "crew" | "admin";
};

export async function resolveEffectiveAccess(repo: Repository, opts: { email?: string; guestId?: string }) {
  const result: EffectiveAccess = {
    selfGuestIds: [],
    cabinIdsManaged: [],
    sailingIdsManaged: [],
    role: "guest",
  };

  if (!opts.email && !opts.guestId) return result;
  const account = opts.email ? await repo.getUserAccountByEmail(opts.email) : null;
  const guestId = opts.guestId || account?.guestId || null;
  if (account?.role) (result.role as EffectiveAccess["role"]) = account.role as any;
  if (guestId) result.selfGuestIds.push(guestId);
  if (guestId) {
    const delegations = await repo.getDelegationsForGuest(guestId);
    for (const d of delegations) {
      if (d.cabinId) result.cabinIdsManaged.push(d.cabinId);
      if (d.sailingId) result.sailingIdsManaged.push(d.sailingId);
      if (d.scope === "MANAGE") (result.role as EffectiveAccess["role"]) = "cabin-manager";
    }
  }
  return result;
}

export function assertCan(action: string, subject: string, ctx: EffectiveAccess & { targetGuestId?: string; targetSailingId?: string; targetCabinId?: string }) {
  const { role } = ctx;
  if (role === "admin" || role === "crew") return;

  switch (subject) {
    case "profile": {
      if (action === "read" || action === "update") {
        if (ctx.targetGuestId && ctx.selfGuestIds.includes(ctx.targetGuestId)) return;
      }
      break;
    }
    case "cabin": {
      if (action === "read-meta") {
        if (ctx.targetCabinId && ctx.cabinIdsManaged.includes(ctx.targetCabinId)) return;
      }
      break;
    }
    case "booking": {
      if (action === "create" || action === "cancel" || action === "read") {
        if (ctx.targetGuestId && ctx.selfGuestIds.includes(ctx.targetGuestId)) return;
        if (ctx.targetCabinId && ctx.cabinIdsManaged.includes(ctx.targetCabinId)) return;
        if (ctx.targetSailingId && ctx.sailingIdsManaged.includes(ctx.targetSailingId)) return;
      }
      break;
    }
  }
  const err = new Error("Forbidden");
  (err as any).status = 403;
  throw err;
}

