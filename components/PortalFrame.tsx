"use client";
import {
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";
import styles from "./PortalFrame.module.css";
import { BOOT } from "@/lib/content";

/* ------------------------------------------------------------------ */
/* Public type — consumed by useBootSequence                           */
/* Compass + sonar removed; rails removed; 4 corner medallions + gem.  */
/* ------------------------------------------------------------------ */
export type PortalElements = {
  art: Element;            // root element that receives .live class & data-idle targeting
  ignite: { el: SVGGElement; power: number; start: number; dur: number }[];
  edges?: SVGPathElement[];    // legacy/optional — rails removed, hook guards on these
  accents?: SVGPathElement[];
};

/* ------------------------------------------------------------------ */
/* Entrance mode type                                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Per-medallion ignite stagger/power                                  */
/* med-compass and its entry removed.                                  */
/* ------------------------------------------------------------------ */
const IGNITE_META = [
  { id: "med-sun",   start: BOOT.igniteStart,        dur: 780, power: 2.4 },
  { id: "med-moon",  start: BOOT.igniteStart + 140,  dur: 780, power: 2.4 },
  { id: "med-orb",   start: BOOT.igniteStart + 280,  dur: 780, power: 2.4 },
  { id: "med-tower", start: BOOT.igniteStart + 420,  dur: 780, power: 2.4 },
  { id: "med-gem",   start: 1980,                    dur: 760, power: 2.6 },
] as const;

/* ------------------------------------------------------------------ */
/* Individual medallion SVG components                                  */
/* Each renders as a small inline SVG, positioned by CSS               */
/* ------------------------------------------------------------------ */

type MedRef = React.RefObject<SVGGElement | null>;

/* ------------------------------------------------------------------ */
/** SUN — top-left corner */
function SunMedallion({ groupRef }: { groupRef: MedRef }) {
  return (
    <svg className={`${styles.medallionSvg} ${styles.cornerTL}`}
      viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <g className={styles.artGroup} stroke="currentColor" fill="none">
        <g className={styles.medallion} id="med-sun" ref={groupRef}>
          <g>
            <circle cx="100" cy="100" r="94" />
            <circle cx="100" cy="100" r="88" />
          </g>
          <g>
            <path d="M96.34,70.22 L100,20 L103.66,70.22" />
            <path d="M108.02,71.09 L125.26,39.02 L114.77,73.89" />
            <path d="M118.47,76.36 L156.57,43.43 L123.64,81.53" />
            <path d="M126.11,85.23 L160.98,74.74 L128.91,91.98" />
            <path d="M129.78,96.34 L180,100 L129.78,103.66" />
            <path d="M128.91,108.02 L160.98,125.26 L126.11,114.77" />
            <path d="M123.64,118.47 L156.57,156.57 L118.47,123.64" />
            <path d="M114.77,126.11 L125.26,160.98 L108.02,128.91" />
            <path d="M103.66,129.78 L100,180 L96.34,129.78" />
            <path d="M91.98,128.91 L74.74,160.98 L85.23,126.11" />
            <path d="M81.53,123.64 L43.43,156.57 L76.36,118.47" />
            <path d="M73.89,114.77 L39.02,125.26 L71.09,108.02" />
            <path d="M70.22,103.66 L20,100 L70.22,96.34" />
            <path d="M71.09,91.98 L39.02,74.74 L73.89,85.23" />
            <path d="M76.36,81.53 L43.43,43.43 L81.53,76.36" />
            <path d="M85.23,73.89 L74.74,39.02 L91.98,71.09" />
          </g>
          <g>
            <path d="M107.65,81.52 L118.48,92.35 L118.48,107.65 L107.65,118.48 L92.35,118.48 L81.52,107.65 L81.52,92.35 L92.35,81.52 Z" />
            <path d="M104.21,89.84 L110.16,95.79 L110.16,104.21 L104.21,110.16 L95.79,110.16 L89.84,104.21 L89.84,95.79 L95.79,89.84 Z" />
            <path d="M104.21,89.84 L107.65,81.52" />
            <path d="M110.16,95.79 L118.48,92.35" />
            <path d="M110.16,104.21 L118.48,107.65" />
            <path d="M104.21,110.16 L107.65,118.48" />
            <path d="M95.79,110.16 L92.35,118.48" />
            <path d="M89.84,104.21 L81.52,107.65" />
            <path d="M89.84,95.79 L81.52,92.35" />
            <path d="M95.79,89.84 L92.35,81.52" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** MOON — top-right corner */
function MoonMedallion({ groupRef }: { groupRef: MedRef }) {
  return (
    <svg className={`${styles.medallionSvg} ${styles.cornerTR}`}
      viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <g className={styles.artGroup} stroke="currentColor" fill="none">
        <g className={styles.medallion} id="med-moon" ref={groupRef}>
          {/* moon-ring */}
          <g>
            <circle cx="100" cy="100" r="94" />
            <circle cx="100" cy="100" r="88" />
          </g>
          {/* moon-crescent (cleaned SVG) */}
          <g>
            <path d="M151,123.7c-13.6,26.5-46.2,37-72.7,23.3-26.5-13.6-37-46.2-23.3-72.7,6.8-13.3,18.9-23.2,33.3-27.3-18.7,20.3-17.5,51.9,2.8,70.7,16.4,15.2,40.9,17.6,60,6Z" />
          </g>
          {/* moon-stars */}
          <g>
            <path d="M102.8,51.7l1.9,6.1,6.1,1.9-6.1,1.9-1.9,6.1-1.9-6.1-6.1-1.9,6.1-1.9,1.9-6.1Z" />
            <path d="M137.6,62.4l1.4,4.6,4.6,1.4-4.6,1.4-1.4,4.6-1.4-4.6-4.6-1.4,4.6-1.4,1.4-4.6Z" />
            <path d="M132.6,105l1.2,3.8,3.8,1.2-3.8,1.2-1.2,3.8-1.2-3.8-3.8-1.2,3.8-1.2,1.2-3.8Z" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** ORB / NEBULA — bottom-left corner */
function OrbMedallion({ groupRef }: { groupRef: MedRef }) {
  return (
    <svg className={`${styles.medallionSvg} ${styles.cornerBL}`}
      viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <g className={styles.artGroup} stroke="currentColor" fill="none">
        <g className={styles.medallion} id="med-orb" ref={groupRef}>
          {/* orb-ring */}
          <g>
            <circle cx="100" cy="100" r="94" />
            <circle cx="100" cy="100" r="88" />
          </g>
          {/* orb-planets (cleaned SVG) */}
          <g>
            <circle cx="83.6" cy="116.7" r="40" />
            <circle cx="132.4" cy="67.3" r="24" />
          </g>
          {/* orb-nebula */}
          <g>
            <circle cx="61.4" cy="132.6" r="1.4" />
            <circle cx="74" cy="88" r="1.4" />
            <circle cx="100" cy="140" r="1.4" />
            <circle cx="112" cy="116" r="1.4" />
            <circle cx="64" cy="118" r="1.4" />
            <circle cx="89.9" cy="102.6" r="1.4" />
            <circle cx="80" cy="134" r="1.4" />
            <circle cx="91.3" cy="119.4" r="1.4" />
            <circle cx="56" cy="98" r="1.4" />
            <path d="M140,132.6h10" />
            <path d="M145,127.6v10" />
            <path d="M43.6,56.9h10" />
            <path d="M48.6,51.9v10" />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** TOWER — bottom-right corner */
function TowerMedallion({ groupRef }: { groupRef: MedRef }) {
  return (
    <svg className={`${styles.medallionSvg} ${styles.cornerBR}`}
      viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <g className={styles.artGroup} stroke="currentColor" fill="none">
        <g className={styles.medallion} id="med-tower" ref={groupRef}>
          {/* tower-ring */}
          <g>
            <circle cx="100" cy="100" r="94" />
            <circle cx="100" cy="100" r="88" />
          </g>
          {/* tower-spire (cleaned SVG) */}
          <g>
            <path d="M100,57.5l-14,80h28.7l-14.7-80Z" />
            <path d="M95,137.5v-26c3.3-8,6.7-8,10,0v26" />
            <path d="M80,137.5l-6-52,12,52" />
            <path d="M120,137.5l6-52-12,52" />
            <path d="M62,137.5h76" />
            <path d="M66,144.5h68" />
            <path d="M70,151.5h60" />
          </g>
          {/* tower-light: apex star + base rays (rays at 0.5 opacity) */}
          <g>
            <path d="M100,38.5l2.1,6.9,6.9,2.1-6.9,2.1-2.1,6.9-2.1-6.9-6.9-2.1,6.9-2.1,2.1-6.9Z" />
            <g opacity="0.5">
              <path d="M100,137.5l-32,20" />
              <path d="M100,137.5l-16,20" />
              <path d="M100,137.5v20" />
              <path d="M100,137.5l16,20" />
              <path d="M100,137.5l32,20" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/** GEM — bottom-center */
function GemMedallion({ groupRef }: { groupRef: MedRef }) {
  return (
    <svg className={`${styles.medallionSvg} ${styles.cornerBC}`}
      viewBox="0 0 60 88" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <g className={styles.artGroup} stroke="currentColor" fill="none">
        <g className={styles.medallion} id="med-gem" ref={groupRef}>
          <path d="M30,4 L54,40 L30,84 L6,40 Z" />
          <path d="M30,17 L44,40 L30,63 L16,40 Z" />
          <path d="M30,4 L30,17" />
          <path d="M54,40 L44,40" />
          <path d="M30,84 L30,63" />
          <path d="M6,40 L16,40" />
          <path d="M16,40 L44,40" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Component props                                                      */
/* ------------------------------------------------------------------ */
export interface PortalFrameProps {
  ref?: Ref<PortalElements>;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export function PortalFrame({ ref }: PortalFrameProps) {
  // Root div — receives .live class from the boot hook; targeted by #art CSS selectors
  const artRef = useRef<HTMLDivElement>(null);

  // Per-medallion refs (compass removed)
  const sunRef   = useRef<SVGGElement>(null);
  const moonRef  = useRef<SVGGElement>(null);
  const orbRef   = useRef<SVGGElement>(null);
  const towerRef = useRef<SVGGElement>(null);
  const gemRef   = useRef<SVGGElement>(null);

  const allMedRefs = [sunRef, moonRef, orbRef, towerRef, gemRef];

  useImperativeHandle(ref, () => {
    // Always use rAF stroke-draw + dissolve glow (baked into useBootSequence)
    const ignite = IGNITE_META.map((m, i) => ({
      el:    allMedRefs[i].current as SVGGElement,
      power: m.power,
      start: m.start,
      dur:   m.dur,
    }));
    return {
      art:    artRef.current as Element,
      ignite,
    };
  }, []);

  // Dissolve+stroke is driven entirely by useBootSequence rAF — no CSS entrance needed.

  return (
    <div className={styles.frameRoot} id="art" ref={artRef}>
      <SunMedallion   groupRef={sunRef} />
      <MoonMedallion  groupRef={moonRef} />
      <OrbMedallion   groupRef={orbRef} />
      <TowerMedallion groupRef={towerRef} />
      <GemMedallion   groupRef={gemRef} />
    </div>
  );
}
