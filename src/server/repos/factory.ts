import { getDbDriver } from "@/server/config";
import type { RepoFactory } from "@/server/repos";
import { createJsonRepo } from "@/server/repos/json";
import { createPrismaRepo } from "@/server/repos/prisma";

export const getRepo = (): ReturnType<RepoFactory> => {
  const driver = getDbDriver();
  if (driver === "prisma") return createPrismaRepo();
  return createJsonRepo();
};

