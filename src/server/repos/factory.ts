import { getDbDriver } from "@/server/config";
import type { RepoFactory } from "@/server/repos";
import { createJsonRepo } from "@/server/repos/json";

export const getRepo = (): ReturnType<RepoFactory> => {
  const driver = getDbDriver();
  if (driver === "prisma") {
    // Avoid importing Prisma on serverless builds unless explicitly enabled
    throw new Error("Prisma driver not enabled in this deployment");
  }
  return createJsonRepo();
};

