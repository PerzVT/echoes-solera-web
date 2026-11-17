"use client";

import type { ReactNode } from "react";
import { artifactName, type ArtifactKey, type View } from "./agent";
import a from "./app.module.css";

/** The work area: a quiet row of tabs for the artifacts made so far, then the one on show. */
export function Workspace({ made, view, onView, children }: { made: ArtifactKey[]; view: View; onView: (k: ArtifactKey) => void; children: ReactNode }) {
  return (
    <>
      {made.length > 0 && (
        <div className={a.tabs} role="tablist" aria-label="Artifacts">
          {made.map((k) => (
            <button key={k} type="button" role="tab" id={`tab-${k}`} aria-selected={view === k} aria-controls="artifact" className={a.tab} onClick={() => onView(k)}>
              {artifactName[k]}
            </button>
          ))}
        </div>
      )}
      <div id="artifact" className={a.view} role={made.length ? "tabpanel" : undefined} aria-labelledby={made.length && view !== "new" ? `tab-${view}` : undefined} key={view}>
        {children}
      </div>
    </>
  );
}
