"use client";

/**
 * Test mode: a switch in the creator header. On, every generation in components/labs/app/generate.ts is simulated
 * in the browser with fixed art from public/labs, so the whole flow can be walked with no API key, no call to the
 * server's generators and nothing charged. Off, generation is real.
 *
 * A person's own choice is kept in localStorage and always wins. Until they make one, test mode follows the
 * server: on while generation is not set up (GET /api/creator/ai/status says not ready), off once it is.
 */
import { useSyncExternalStore } from "react";
import type { AiStatus } from "@/lib/labs/ai/contract";

const KEY = "nine-lives:test-mode";

let serverReady: boolean | null = null;
let statusRead: Promise<boolean> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function chosen(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "1" ? true : v === "0" ? false : null;
  } catch {
    return null;
  }
}

/** Whether the server can generate, read once per page load. */
export function readServerReady(): Promise<boolean> {
  statusRead ??= fetch("/api/creator/ai/status", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<AiStatus>) : ({ ready: false } as const)))
    .catch(() => ({ ready: false }) as const)
    .then((s) => {
      serverReady = s.ready;
      notify();
      return s.ready;
    });
  return statusRead;
}

/** Test mode as it stands now. Before the server has answered, and with no choice made, it counts as on. */
export function testModeNow(): boolean {
  return chosen() ?? !(serverReady ?? false);
}

/** Test mode once the server's answer is in: what generate.ts asks before every generation. */
export async function isTestMode(): Promise<boolean> {
  const own = chosen();
  if (own !== null) return own;
  return !(await readServerReady());
}

export function setTestMode(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  notify();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  void readServerReady();
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Test mode for a component; null on the server and in the first render, so markup matches. */
export function useTestMode(): boolean | null {
  return useSyncExternalStore(subscribe, () => (chosen() !== null || serverReady !== null ? testModeNow() : null), () => null);
}
