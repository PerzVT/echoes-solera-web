"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PigmentField } from "./PigmentField";

type Level = "low" | "medium" | "high";
const levels: Level[] = ["low", "medium", "high"];

/**
 * The pigment field behind every labs page. A page asks for more of it by putting
 * `data-backdrop="medium"` or `"high"` on any element it renders (the home page, the not-found page,
 * the pack desk and the pipeline do); pages that are for reading say nothing and get `low`. In the
 * creator the work frame covers almost all of it, so there it stays a still picture.
 */
export function SiteBackdrop() {
  const path = usePathname();
  const [level, setLevel] = useState<Level>("low");

  useEffect(() => {
    const root = document.querySelector(".nl");
    if (!root) return;
    const read = () => {
      const asked = root.querySelector("[data-backdrop]")?.getAttribute("data-backdrop") as Level | null;
      setLevel(asked && levels.includes(asked) ? asked : "low");
    };
    // Once now, and once two frames on, when a page that arrived with this path has committed.
    read();
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(read);
    });
    return () => cancelAnimationFrame(raf);
  }, [path]);

  return <PigmentField intensity={level} still={path.startsWith("/app")} />;
}
