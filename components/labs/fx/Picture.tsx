"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./Picture.module.css";

type Props = ImageProps & {
  /** For cut-outs and other art with transparency: no placeholder tile behind it, only the fade. */
  bare?: boolean;
};

/**
 * `next/image` with a loading state built in, and no wrapper element, so it drops into any layout the
 * plain image was in. Until the file has loaded the image box shows the skeleton surface with a sheen;
 * then the picture fades in over 220 ms. An image that was already loaded when the page hydrated
 * (cached, or loaded while the script was arriving) is left alone: no fade, no flash. Without script
 * nothing is hidden. The box is sized by the image's own width and height or by its parent, as before,
 * so nothing shifts.
 */
export function Picture({ bare, className, alt, ...rest }: Props) {
  // Pictures behind the session (/api/creator/files) and ones made in this tab cannot go through the image optimiser.
  if (rest.unoptimized === undefined && typeof rest.src === "string" && /^(\/api\/|blob:|data:)/.test(rest.src)) rest = { ...rest, unoptimized: true };
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"idle" | "wait" | "in" | "done">("idle");

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (img.complete) {
      setState("done");
      return;
    }
    setState("wait");
    const show = () => setState("in");
    img.addEventListener("load", show);
    // A broken image still has to show its alt text.
    img.addEventListener("error", show);
    return () => {
      img.removeEventListener("load", show);
      img.removeEventListener("error", show);
    };
  }, []);

  return <Image ref={ref} alt={alt} className={[styles.pic, className].filter(Boolean).join(" ")} data-pic={state} data-bare={bare ? "" : undefined} {...rest} />;
}
