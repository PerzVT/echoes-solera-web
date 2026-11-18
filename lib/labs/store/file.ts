import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { PARENT, type Store, type StoredFile, type Table, type Tables } from "./types";

/**
 * Local development: each table is a JSON file under .data/ in the repo root (uploaded bytes go under
 * .data/uploads/, see bytes.ts). Writes go through one queue, so two requests never write a file at once.
 */
const ROOT = path.join(process.cwd(), ".data");

let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw e;
  }
}

async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 1));
  await rename(tmp, file);
}

const tableFile = (table: Table | "files") => path.join(ROOT, `${table}.json`);
const rows = <T extends Table>(table: T) => readJson<Tables[T][]>(tableFile(table), []);
const files = () => readJson<StoredFile[]>(tableFile("files"), []);

export const fileStore: Store = {
  async list(table, parent) {
    const all = await rows(table);
    const field = PARENT[table] as string | null;
    return field && parent !== undefined ? all.filter((r) => (r as Record<string, unknown>)[field] === parent) : all;
  },
  async get(table, id) {
    return (await rows(table)).find((r) => r.id === id) ?? null;
  },
  put: (table, row) =>
    serial(async () => {
      const all = await rows(table);
      const at = all.findIndex((r) => r.id === row.id);
      if (at >= 0) all[at] = row;
      else all.push(row);
      await writeJson(tableFile(table), all);
    }),
  remove: (table, ids) =>
    serial(async () => {
      if (!ids.length) return;
      const all = await rows(table);
      await writeJson(
        tableFile(table),
        all.filter((r) => !ids.includes(r.id)),
      );
    }),
  putFile: (file) =>
    serial(async () => {
      await writeJson(tableFile("files"), [...(await files()).filter((f) => f.key !== file.key), file]);
    }),
  async getFile(key) {
    return (await files()).find((f) => f.key === key) ?? null;
  },
  removeFiles: (keys) =>
    serial(async () => {
      if (!keys.length) return [];
      const all = await files();
      await writeJson(
        tableFile("files"),
        all.filter((f) => !keys.includes(f.key)),
      );
      return all.filter((f) => keys.includes(f.key));
    }),
};
