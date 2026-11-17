"use client";

import { Picture as Image } from "@/components/labs/fx/Picture";
import { useState } from "react";
import styles from "./world.module.css";

export type Outfit = { name: string; /** Cell on the 3 x 2 study sheet. */ col: number; row: number; /** FOMO wearing it, where that art exists. */ worn?: string };

/** The six-outfit study as a picker: choose an outfit to see it large, and on FOMO where that art exists. */
export function Wardrobe({ sheet, outfits }: { sheet: string; outfits: Outfit[] }) {
  const [pick, setPick] = useState(0);
  const o = outfits[pick];
  const cell = (x: Outfit) => ({ "--col": x.col, "--row": x.row }) as React.CSSProperties;

  return (
    <div className={styles.wardrobe}>
      <div className={styles.fitting} aria-live="polite">
        <div className={styles.fitArt}>
          <span className={styles.crop} style={cell(o)}>
            <Image src={sheet} alt="" width={1536} height={1024} sizes="(max-width: 900px) 240vw, 1200px" />
          </span>
          {/* The slot is always there, so the layout holds between picks. */}
          <span className={styles.wornSlot}>
            {o.worn ? (
              <Image bare className={styles.worn} src={o.worn} alt={`FOMO wearing the ${o.name.toLowerCase()}`} width={720} height={960} sizes="(max-width: 900px) 45vw, 300px" />
            ) : (
              <span className="small muted">Not drawn on FOMO yet</span>
            )}
          </span>
        </div>
        <p className="h3">{o.name}</p>
      </div>
      <ul className={styles.rail} aria-label="Outfits">
        {outfits.map((x, i) => (
          <li key={x.name}>
            <button type="button" className={styles.hanger} aria-pressed={i === pick} onClick={() => setPick(i)}>
              <span className={styles.crop} style={cell(x)}>
                <Image src={sheet} alt="" width={1536} height={1024} sizes="(max-width: 900px) 90vw, 330px" />
              </span>
              <span className={styles.hangerName}>{x.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
