import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import type { Store } from "./types";

/** Postgres when DATABASE_URL is set, otherwise JSON files under .data/ for local development. */
export function getStore(): Store {
  return process.env.DATABASE_URL ? postgresStore : fileStore;
}

export type * from "./types";
