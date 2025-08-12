import type { RepoFactory } from "@/server/repos";

export const createPrismaRepo: RepoFactory = () => {
  // Postgres driver is not active in demo mode.
  throw new Error("Prisma repository not implemented in demo mode");
};

