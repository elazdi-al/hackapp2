import { PostgresStore } from "@mastra/pg";

import { env } from "@/lib/env";

const globalForMastraStorage = globalThis as unknown as {
  mastraPostgresStore?: PostgresStore;
};

export const mastraPostgresStore =
  globalForMastraStorage.mastraPostgresStore ??
  new PostgresStore({
    id: "procuretrace-mastra-store",
    connectionString: env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMastraStorage.mastraPostgresStore = mastraPostgresStore;
}

