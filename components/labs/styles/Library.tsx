"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ComponentProps } from "react";
import { useCast } from "@/components/labs/app/CastProvider";
import { Button } from "@/components/labs/Button";
import { seriesCards } from "@/lib/labs/maker";
import { UseIn } from "./StyleView";

/**
 * A library card. On a wide screen it opens the preview beside the grid (the address carries `?style=`, so the
 * panel survives a reload and Back closes it); on a phone, where there is no room for the panel, it opens the
 * style's own page.
 */
export function CardLink({ page, ...rest }: ComponentProps<typeof Link> & { page: string }) {
  const router = useRouter();
  return (
    <Link
      {...rest}
      scroll={false}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (window.matchMedia("(max-width: 900px)").matches) {
          e.preventDefault();
          router.push(page);
        }
      }}
    />
  );
}

/** "Use in series" from the preview: the same choice the style's page offers. */
export function UseInSeries({ styleName, usedBy }: { styleName: string; usedBy?: string }) {
  const store = useCast();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(usedBy);
  const button = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };
  return (
    <>
      <Button ref={button} onClick={() => setOpen(true)}>
        Use in series
      </Button>
      <UseIn
        key={styleName}
        open={open}
        styleName={styleName}
        series={[...store.created, ...seriesCards].map((x) => x.title)}
        current={current}
        onClose={close}
        onUse={(title) => {
          setCurrent(title);
          close();
        }}
      />
    </>
  );
}
