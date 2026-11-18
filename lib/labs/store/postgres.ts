import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { PARENT, type Store, type StoredFile, type Table, type Tables } from "./types";

/**
 * The postgres adapter, used whenever DATABASE_URL is set. It talks to Neon over HTTP. The schema is
 * lib/labs/store/schema.sql (tables prefixed nl_), applied by the adapter itself before its first query.
 */

type Row = Record<string, unknown>;

let client: NeonQueryFunction<false, false> | undefined;
const db = () => (client ??= neon(process.env.DATABASE_URL!));

/**
 * The schema, once per server process. Every statement is `if not exists`, so a second process or a rerun
 * changes nothing; one shared promise keeps two first requests from both running it. A failure clears the
 * promise, so the next request tries again.
 */
let ready: Promise<void> | undefined;
function ensureSchema() {
  ready ??= (async () => {
    const text = await readFile(path.join(process.cwd(), "lib/labs/store/schema.sql"), "utf8");
    const statements = text
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .split(/;\s*(?:\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);
    // One at a time: a table must exist before its indexes and the tables that point at it.
    for (const statement of statements) await db().query(statement);
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}

/**
 * Runs one parameterised query ($1, $2, ...) and returns its rows. This is the only place the driver is called;
 * lib/labs/store/jobs.ts uses it for the jobs table.
 */
export async function sql(query: string, params: unknown[] = []): Promise<Row[]> {
  await ensureSchema();
  return (await db().query(query, params)) as Row[];
}

/** The record fields of each table, in column order. Every name is fixed here, never taken from a request. */
const FIELDS: { [T in Table]: (keyof Tables[T] & string)[] } = {
  series: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "title", "tool", "style", "cover"],
  episodes: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "seriesId", "number", "title", "step"],
  scripts: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "episodeId", "text", "fileName", "file"],
  screenplays: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "episodeId", "texts", "notes", "changed"],
  cast_sheets: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "seriesId", "character", "variant", "tag", "image"],
  choices: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "episodeId", "cast", "style", "references"],
  storyboards: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "title", "source", "style", "frames", "step"],
  mangas: ["id", "owner", "updatedBy", "createdAt", "updatedAt", "title", "source", "style", "pageCount", "pages", "step"],
};
const FILE_FIELDS: (keyof StoredFile)[] = ["key", "name", "type", "size", "location", "owner", "createdAt"];
/** Fields kept as jsonb. */
const JSON_FIELDS = new Set(["texts", "notes", "changed", "cast", "references", "frames", "pages"]);

const name = (table: Table | "files") => `nl_${table}`;
const snake = (field: string) => field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const column = (field: string) => `"${snake(field)}"`;

/** A database row back to a record: snake_case to camelCase, timestamps to ISO strings. */
function toRecord<T>(fields: string[], row: Row): T {
  const out: Row = {};
  for (const field of fields) {
    const value = row[snake(field)];
    out[field] = value instanceof Date ? value.toISOString() : (value ?? null);
  }
  return out as T;
}

const selectFrom = (table: Table) => `select ${FIELDS[table].map(column).join(", ")} from ${name(table)}`;

export const postgresStore: Store = {
  async list(table, parent) {
    const field = PARENT[table] as string | null;
    const rows =
      field && parent !== undefined
        ? await sql(`${selectFrom(table)} where ${column(field)} = $1 order by created_at`, [parent])
        : await sql(`${selectFrom(table)} order by created_at`);
    return rows.map((r) => toRecord<Tables[typeof table]>(FIELDS[table], r));
  },

  async get(table, id) {
    const [row] = await sql(`${selectFrom(table)} where id = $1`, [id]);
    return row ? toRecord<Tables[typeof table]>(FIELDS[table], row) : null;
  },

  async put(table, row) {
    const fields = FIELDS[table] as string[];
    const values = fields.map((f) => {
      const v = (row as Row)[f];
      return JSON_FIELDS.has(f) && v !== null && v !== undefined ? JSON.stringify(v) : (v ?? null);
    });
    const cols = fields.map(column);
    // The maker and the creation time never change after the first write.
    const update = cols.filter((c) => !['"id"', '"owner"', '"created_at"'].includes(c)).map((c) => `${c} = excluded.${c}`);
    await sql(
      `insert into ${name(table)} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) on conflict (id) do update set ${update.join(", ")}`,
      values,
    );
  },

  async remove(table, ids) {
    if (ids.length) await sql(`delete from ${name(table)} where id = any($1)`, [ids]);
  },

  async putFile(file) {
    const cols = FILE_FIELDS.map(column);
    await sql(
      `insert into ${name("files")} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`,
      FILE_FIELDS.map((f) => file[f]),
    );
  },

  async getFile(key) {
    const [row] = await sql(`select ${FILE_FIELDS.map(column).join(", ")} from ${name("files")} where key = $1`, [key]);
    return row ? toRecord<StoredFile>(FILE_FIELDS, row) : null;
  },

  async removeFiles(keys) {
    if (!keys.length) return [];
    const rows = await sql(`delete from ${name("files")} where key = any($1) returning ${FILE_FIELDS.map(column).join(", ")}`, [keys]);
    return rows.map((r) => toRecord<StoredFile>(FILE_FIELDS, r));
  },
};
