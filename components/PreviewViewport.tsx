"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PreviewViewport.module.css";

type Mode = "app" | "web";
type Props = {
  src: string;
  title: string;
  storageKey: string;
  theme?: "light" | "dark";
};

export default function PreviewViewport({ src, title, storageKey, theme = "light" }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [choice, setChoice] = useState<Mode | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "app" || saved === "web") setChoice(saved);
    } catch { /* Layout switching also works without browser storage. */ }
    const element = stage.current;
    if (!element) return;
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [storageKey]);

  const mode = choice ?? (size.width > 800 ? "web" : "app");
  const width = mode === "app" ? Math.min(390, size.width) : Math.max(1180, size.width);
  const scale = width ? Math.min(1, size.width / width) : 1;
  const height = mode === "app" ? Math.min(844, size.height) : size.height / scale;

  function releaseLegacyOverride() {
    try {
      const document = frame.current?.contentDocument;
      document?.body.classList.remove("portrait");
      const previousSwitch = document?.getElementById("format");
      if (previousSwitch) previousSwitch.hidden = true;
      frame.current?.contentWindow?.dispatchEvent(new Event("resize"));
    } catch { /* The viewport itself does not require document access. */ }
  }

  function select(next: Mode) {
    setChoice(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Keep the session choice. */ }
    releaseLegacyOverride();
  }

  return (
    <section className={styles.shell} data-theme={theme} aria-label={`${title} layout preview`}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Preview layout</span>
        <div className={styles.switcher} role="group" aria-label="Preview layout">
          <button type="button" aria-pressed={mode === "app"} onClick={() => select("app")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></svg>
            App view
          </button>
          <button type="button" aria-pressed={mode === "web"} onClick={() => select("web")}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M12 17v4M7 21h10" /></svg>
            Web view
          </button>
        </div>
      </div>
      <div className={styles.stage} ref={stage} data-mode={mode}>
        {size.width > 0 && size.height > 0 && (
          <div className={styles.viewport} style={{ width: width * scale, height: height * scale }}>
            <iframe
              ref={frame}
              title={title}
              src={src}
              allow="autoplay; fullscreen"
              onLoad={releaseLegacyOverride}
              style={{ width, height, transform: `scale(${scale})` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
