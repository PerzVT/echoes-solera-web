/**
 * Dissolves what an element shows now into what it shows next. Call it in the handler, before the
 * state change: it lays a copy of the element as it is over the element and fades the copy out
 * (the exit token), so the new content is already underneath at full strength and nothing dips or jumps.
 * `dy` also brings the new content in from that many pixels below (negative: above); it moves the parts
 * marked data-move, or the element itself when there are none. Under reduced motion only the fade runs.
 *
 * Not for an element that holds a video or a canvas: a copy of those is blank.
 */
export function crossfade(el: HTMLElement | null | undefined, opts: { dy?: number } = {}) {
  const parent = el?.parentElement;
  if (!el || !parent || typeof el.animate !== "function") return;
  const css = getComputedStyle(el);
  const ms = (name: string, fallback: number) => parseFloat(css.getPropertyValue(name)) || fallback;
  const ease = css.getPropertyValue("--ease-out").trim() || "ease-out";

  const ghost = el.cloneNode(true) as HTMLElement;
  // A copy must not answer to the page: no ids to collide, no radio taking the checked state from its twin, no focus.
  ghost.removeAttribute("id");
  ghost.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  ghost.querySelectorAll("input[name]").forEach((n) => n.removeAttribute("name"));
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  Object.assign(ghost.style, {
    position: "absolute",
    top: `${el.offsetTop}px`,
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
    height: `${el.offsetHeight}px`,
    margin: "0",
    zIndex: "2",
    overflow: "hidden",
    pointerEvents: "none",
  });
  const scrolled = [...el.querySelectorAll<HTMLElement>("*")].map((n) => n.scrollTop);
  parent.appendChild(ghost);
  ghost.scrollTop = el.scrollTop;
  if (scrolled.some(Boolean)) {
    ghost.querySelectorAll<HTMLElement>("*").forEach((n, i) => {
      if (scrolled[i]) n.scrollTop = scrolled[i];
    });
  }

  const out = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms("--dur-exit", 120), easing: "linear", fill: "forwards" });
  const done = () => ghost.remove();
  out.onfinish = done;
  out.oncancel = done;

  const dy = opts.dy ?? 0;
  if (!dy || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // One frame on, React has drawn the new content.
  requestAnimationFrame(() => {
    const parts = el.querySelectorAll<HTMLElement>("[data-move]");
    (parts.length ? [...parts] : [el]).forEach((n) =>
      n.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], { duration: ms("--dur-move", 200), easing: ease }),
    );
  });
}
