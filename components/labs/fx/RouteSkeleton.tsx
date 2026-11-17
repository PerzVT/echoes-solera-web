"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { BusyScreen, PageLoading } from "./RouteLoading";
import styles from "./RouteSkeleton.module.css";

/*
 * Skeletons on navigation, without loading.tsx.
 *
 * A loading.tsx makes Next send the skeleton as the page's HTML and swap the real content in with
 * script, on every route that has one, prerendered or not (checked on the production build: the page
 * arrives in a hidden element behind a pending boundary). A visitor without script would be left on
 * the skeleton. So the public routes have no loading.tsx. Instead this watches for a press on an
 * internal link: if the new page has not arrived 180 ms later, the destination's own skeleton is laid
 * over the current page until it does. Server HTML is never touched, and a prefetched page (the usual
 * case) arrives before the wait is over, so nothing flashes.
 *
 * Each route's skeleton is a `skeleton.tsx` beside its page, loaded on demand and warmed as soon as a
 * pointer enters, focus reaches or a finger touches a link to that route. The layer is never an empty
 * sheet: while a route's own skeleton is still on its way, the generic one in the main bundle
 * (`PageLoading`, or `BusyScreen` in the creator) fills it. Once shown, a skeleton stays at least
 * 320 ms and fades out, so it never flashes for a frame.
 *
 * Cancelling. A page that stops a navigation after the press (an "unsent changes" guard, say) must
 * call `cancelRouteSkeleton()` when it decides to stay, or the skeleton would come up over a page
 * that is not leaving. Call it before showing the guard's own question, so the skeleton cannot appear
 * behind it, and again if the visitor chooses to stay:
 *
 *   import { cancelRouteSkeleton } from "@/components/labs/fx/RouteSkeleton";
 *   if (hasUnsentChanges) { cancelRouteSkeleton(); ...ask, then router.push only if they agree }
 *
 * A cancel drops the skeleton at once, without the 320 ms hold. A link, or any element around links,
 * with `data-route-skeleton="off"` never starts one.
 */
const CANCEL = "labs:route-skeleton-cancel";

/** Drops a pending or showing navigation skeleton. Safe to call at any time, from any client code. */
export function cancelRouteSkeleton() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CANCEL));
}

type Load = () => Promise<{ default: ComponentType }>;
type Route = { re: RegExp; load: Load; Skeleton: LazyExoticComponent<ComponentType> };
const route = (re: RegExp, load: Load): Route => ({ re, load, Skeleton: lazy(load) });

const routes: Route[] = [
  route(/^\/$/, () => import("./RouteLoading").then((m) => ({ default: m.HomeLoading }))),
  route(/^\/mini-series$/, () => import("@/app/(labs)/mini-series/skeleton")),
  route(/^\/anime\/echoes-of-solera$/, () => import("@/app/(labs)/anime/echoes-of-solera/skeleton")),
  route(/^\/cooking\/shoujo-supper$/, () => import("@/app/(labs)/cooking/shoujo-supper/skeleton")),
  route(/^\/(mini-series\/[^/]+|anime\/echoes-of-solera\/watch|cooking\/shoujo-supper\/watch)$/, () =>
    import("./RouteLoading").then((m) => ({ default: m.WatchLoading })),
  ),
  route(/^\/worlds\/tidebell-cove$/, () => import("@/app/(labs)/worlds/tidebell-cove/skeleton")),
  route(/^\/cards$/, () => import("@/app/(labs)/cards/skeleton")),
  route(/^\/cards\/packs$/, () => import("@/app/(labs)/cards/packs/skeleton")),
  route(/^\/manga\/golden-ticket$/, () => import("@/app/(labs)/manga/golden-ticket/skeleton")),
  route(/^\/visual-novel\/after-hours$/, () => import("@/app/(labs)/visual-novel/after-hours/skeleton")),
  route(/^\/game-ads$/, () => import("@/app/(labs)/game-ads/skeleton")),
  route(/^\/shop$/, () => import("@/app/(labs)/shop/skeleton")),
  route(/^\/shop\/[^/]+$/, () => import("@/app/(labs)/shop/[slug]/skeleton")),
  route(/^\/studio$/, () => import("@/app/(labs)/studio/skeleton")),
  route(/^\/lab$/, () => import("@/app/(labs)/lab/skeleton")),
  route(/^\/pipeline$/, () => import("@/app/(labs)/pipeline/skeleton")),
  route(/^\/pipeline\/[^/]+$/, () => import("@/app/(labs)/pipeline/[function]/skeleton")),
  // The creator.
  route(/^\/app$/, () => import("@/app/(labs)/app/skeleton")),
  route(/^\/app\/library$/, () => import("@/app/(labs)/app/library/skeleton")),
  route(/^\/app\/cooking$/, () => import("@/app/(labs)/app/cooking/skeleton")),
  route(/^\/app\/cooking\/library$/, () => import("@/app/(labs)/app/cooking/library/skeleton")),
  route(/^\/app\/anime$/, () => import("@/app/(labs)/app/anime/skeleton")),
  route(/^\/app\/anime\/new$/, () => import("@/app/(labs)/app/anime/new/skeleton")),
  route(/^\/app\/anime\/new\/(screenplay|cast|style)$/, () => import("@/app/(labs)/app/anime/new/cast/skeleton")),
  route(/^\/app\/anime\/new\/storyboard$/, () => import("@/app/(labs)/app/anime/new/storyboard/skeleton")),
  route(/^\/app\/anime\/[^/]+$/, () => import("@/app/(labs)/app/anime/[canvas]/skeleton")),
  route(/^\/app\/episode\/screenplay$/, () => import("@/app/(labs)/app/episode/screenplay/skeleton")),
  route(/^\/app\/episode\/cast$/, () => import("@/app/(labs)/app/episode/cast/skeleton")),
  route(/^\/app\/episode\/style$/, () => import("@/app/(labs)/app/episode/style/skeleton")),
  route(/^\/app\/episode\/results$/, () => import("@/app/(labs)/app/episode/results/skeleton")),
  route(/^\/app\/series\/[^/]+$/, () => import("@/app/(labs)/app/series/[slug]/skeleton")),
];
const match = (path: string) => routes.find((r) => r.re.test(path));

const WAIT = 180;
const HOLD = 320;
const LEAVE = 120;
const GIVE_UP = 10000;

/** The internal labs page a link goes to, or null for anything that is not a move to another page. */
function destination(el: EventTarget | null): string | null {
  const a = (el as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
  if (a.closest('[data-route-skeleton="off"]')) return null;
  const url = new URL(a.href, location.href);
  // Only a move to another labs page; a change of ?ep= or ?p= or a #hash stays on the page.
  if (url.origin !== location.origin || url.pathname === location.pathname) return null;
  return match(url.pathname) ? url.pathname : null;
}

export function RouteSkeleton() {
  const path = usePathname();
  const [target, setTarget] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const shownAt = useRef(0);
  const warmed = useRef(new Set<Load>());

  const stop = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  const clear = () => {
    stop();
    shownAt.current = 0;
    setTarget(null);
    setShown(false);
    setLeaving(false);
  };
  /** The page has arrived: a skeleton that is up stays its minimum time, then fades out. */
  const finish = () => {
    if (!shownAt.current) return clear();
    stop();
    const rest = Math.max(0, HOLD - (performance.now() - shownAt.current));
    timers.current = [
      window.setTimeout(() => setLeaving(true), rest),
      window.setTimeout(clear, rest + LEAVE),
    ];
  };

  // The new page has arrived (or the address changed some other way): the skeleton's job is over.
  useEffect(finish, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warm = (e: Event) => {
      const to = destination(e.target);
      const r = to && match(to);
      if (!r || warmed.current.has(r.load)) return;
      warmed.current.add(r.load);
      r.load().catch(() => warmed.current.delete(r.load));
    };
    const onClick = (e: MouseEvent) => {
      // Capture phase: next/link prevents the default action itself, so it cannot be used as a signal.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const to = destination(e.target);
      if (!to) return;
      clear();
      setTarget(to);
      timers.current = [
        window.setTimeout(() => {
          shownAt.current = performance.now();
          setShown(true);
        }, WAIT),
        window.setTimeout(clear, GIVE_UP),
      ];
    };
    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointerover", warm, opts);
    document.addEventListener("focusin", warm, opts);
    document.addEventListener("touchstart", warm, opts);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", clear);
    window.addEventListener("pagehide", clear);
    window.addEventListener(CANCEL, clear);
    return () => {
      document.removeEventListener("pointerover", warm, opts);
      document.removeEventListener("focusin", warm, opts);
      document.removeEventListener("touchstart", warm, opts);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", clear);
      window.removeEventListener("pagehide", clear);
      window.removeEventListener(CANCEL, clear);
      stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const r = target ? match(target) : undefined;
  if (!r || !shown) return null;
  const Fallback = target!.startsWith("/app") ? BusyScreen : PageLoading;
  return (
    <div className={styles.over} data-route-skeleton-overlay="" data-leaving={leaving || undefined}>
      <Suspense fallback={<Fallback />}>
        <r.Skeleton />
      </Suspense>
    </div>
  );
}
