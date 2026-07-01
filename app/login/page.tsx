"use client";
import { useRef } from "react";
import { PortalFrame, type PortalElements } from "@/components/PortalFrame";
import { Starfield } from "@/components/Starfield";
import { CenterCard } from "@/components/CenterCard";
import { useBootSequence } from "@/hooks/useBootSequence";
import { useDiveSequence } from "@/hooks/useDiveSequence";
import { DiveTerminal } from "@/components/dive/DiveTerminal";
import { DiveWelcome } from "@/components/dive/DiveWelcome";
import { DiveStatusBar } from "@/components/dive/DiveStatusBar";
import { SubtleCrtGlitch } from "@/components/dive/SubtleCrtGlitch";
import Image from "next/image";
import styles from "./page.module.css";

const DENSITY = 14;

export default function DivePage() {
  const frameRef = useRef<PortalElements>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flickerEnabledRef = useRef<boolean>(true);

  const { phase, replay: replayDive } = useDiveSequence(true);

  const { phase: bootPhase, replay: replayBoot } = useBootSequence(
    frameRef,
    cardRef,
    flickerEnabledRef
  );

  const replay = () => {
    replayBoot();
    replayDive();
  };

  const awakened =
    phase === "awaken" || phase === "welcome" || phase === "severed" || phase === "error";
  const cardVisible = phase === "error";
  const glitchEnabled = phase === "error" && bootPhase === "idle";
  const isSevered = phase === "severed";

  return (
    <main className={styles.diveStage} data-idle="rich" data-phase={phase}>
      {/* Logo watermark - top-left, fades in during boot, fades out on error */}
      <div className={`${styles.logo} ${phase === "error" ? styles.logoOut : ""}`}>
        <Image
          src="/logo-solera.svg"
          alt="Echoes of Solera"
          width={160}
          height={88}
          priority
        />
      </div>

      {/* Atmos #1 — always on */}
      <div className={styles.dotsAtmos} />

      <div className={`${styles.scene} ${awakened ? styles.sceneIn : ""}`}>
        <Starfield density={DENSITY} />
        <PortalFrame ref={frameRef} />
      </div>

      <DiveTerminal phase={phase} />

      {(phase === "black" || phase === "autofill") && <DiveStatusBar phase={phase} />}

      <DiveWelcome phase={phase} />

      <div className={`${styles.card} ${cardVisible ? styles.cardIn : ""}`}>
        <CenterCard cardRef={cardRef} />
      </div>

      <div className={styles.vignette} />

      {/* CRT always-on during error phase, cursor-reactive */}
      <SubtleCrtGlitch enabled={glitchEnabled} />

      {isSevered && <div className={styles.severWash} />}

      {/* REPLAY button — bottom-center, error phase only */}
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
