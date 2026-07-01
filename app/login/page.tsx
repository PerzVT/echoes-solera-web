"use client";
import { useRef, useCallback } from "react";
import { PortalFrame, type PortalElements } from "@/components/PortalFrame";
import { Starfield } from "@/components/Starfield";
import { CenterCard } from "@/components/CenterCard";
import { useDiveDirector } from "@/hooks/useDiveDirector";
import { DiveTerminal } from "@/components/dive/DiveTerminal";
import { DiveWelcome } from "@/components/dive/DiveWelcome";
import { DiveStatusBar } from "@/components/dive/DiveStatusBar";
import { SubtleCrtGlitch } from "@/components/dive/SubtleCrtGlitch";
import styles from "./page.module.css";

const DENSITY = 14;

export default function DivePage() {
  const frameRef = useRef<PortalElements>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flickerEnabledRef = useRef<boolean>(true);

  const { phase, cueActive, cueComplete, replay } = useDiveDirector({
    frameRef,
    cardRef,
    flickerEnabledRef,
  });

  const handleTypeComplete = useCallback(() => {
    // Signal the director that terminal typing finished early
    // (The cue engine will use this or fall back to duration timeout)
  }, []);

  const handleAutofillComplete = useCallback(() => {
    // Signal autofill finished
  }, []);

  const awakened =
    phase === "awaken" || phase === "welcome" || phase === "severed" || phase === "error";
  const cardVisible = phase === "error";
  const glitchEnabled = phase === "error" && cueComplete("idle");
  const isSevered = phase === "severed";

  return (
    <main className={styles.diveStage} data-idle="rich" data-phase={phase}>
      <div className={styles.dotsAtmos} />

      <div className={`${styles.scene} ${awakened ? styles.sceneIn : ""}`}>
        <Starfield density={DENSITY} />
        <PortalFrame ref={frameRef} />
      </div>

      <DiveTerminal
        phase={phase}
        onTypeComplete={handleTypeComplete}
        onAutofillComplete={handleAutofillComplete}
      />

      {(phase === "black" || phase === "autofill") && <DiveStatusBar phase={phase} />}

      <DiveWelcome phase={phase} />

      <div className={`${styles.card} ${cardVisible ? styles.cardIn : ""}`}>
        <CenterCard cardRef={cardRef} />
      </div>

      <div className={styles.vignette} />

      <SubtleCrtGlitch enabled={glitchEnabled} />

      {isSevered && <div className={styles.severWash} />}

      {phase === "error" && (
        <button
          className={styles.replayBtn}
          onClick={replay}
          aria-label="Replay the dive"
        >
          REPLAY
        </button>
      )}
    </main>
  );
}
