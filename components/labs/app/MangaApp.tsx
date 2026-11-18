"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Lettering } from "@/app/(labs)/manga/golden-ticket/Lettering";
import { AsciiField, GestureIcon, Skeleton } from "@/components/labs/fx";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { Icon } from "@/components/labs/Icon";
import { Btn } from "@/components/labs/chat/ui";
import type { MangaLetter, MangaPage } from "./api";
import { PAGE_COUNTS, mangaStyles } from "./fixtures";
import { makeMangaPages, regeneratePage } from "./generate";
import { Alert, SaveAction, revealOnPhone, useSaveThen } from "./parts";
import { Preview } from "./Preview";
import { SourceStart } from "./SourceStart";
import { Menu, WorkCards, WorkLoading } from "./StoryboardApp";
import { StylePicker } from "./StylePicker";
import { titleOf, useMangas } from "./work";
import type { WorkStepDef } from "./WorkShell";
import { WorkShell } from "./WorkShell";
import b from "./Storyboard.module.css";
import m from "./Manga.module.css";

export const MANGA_STEPS: WorkStepDef[] = [
  { key: "story", label: "Story", href: "/app/manga?edit=1" },
  { key: "style", label: "Style", href: "/app/manga/style" },
  { key: "pages", label: "Pages", href: "/app/manga/pages" },
  { key: "read", label: "Read", href: "/app/manga/read" },
];
const LIBRARY = "/app/manga/library";
const KIND: Record<MangaLetter["kind"], string> = { speech: "Speech", narration: "Narration", sfx: "Sound", inset: "Lettering" };

const message = (e: unknown, fallback = "That did not save. Try again.") => (e instanceof Error && e.message ? e.message : fallback);

/** A page as it is printed: the wordless art with its lettering set over it as live text. */
function Page({ page, n, sizes, eager }: { page: MangaPage; n: number; sizes: string; eager?: boolean }) {
  return (
    <span className={m.sheet}>
      {page.image ? (
        <Image className={m.img} src={page.image} alt={`Page ${n}. ${page.alt}`} width={1024} height={1536} sizes={sizes} loading={eager ? "eager" : undefined} />
      ) : (
        // Art still being drawn: the page holds its shape, glyphs scan where the art will be.
        <span className={m.pending} role="img" aria-label={`Page ${n}, being drawn`}>
          <AsciiField mode="scan" cell={6} intensity={0.5} speed={1.15} className={b.glyphs} />
        </span>
      )}
      <Lettering letters={page.letters} />
    </span>
  );
}

/* ---------- Story ---------- */

/** /app/manga: a story or script passage to draw. Opened from the step bar (?edit=1) it shows the current manga's story. */
export function MangaStart({ edit }: { edit: boolean }) {
  const router = useRouter();
  const work = useMangas();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const editing = edit ? work.current : null;
  if (edit && work.opening) return <WorkLoading tool="manga" steps={MANGA_STEPS} step="story" />;

  const submit = async (source: string) => {
    setSending(true);
    setError("");
    try {
      if (editing) {
        if (source !== editing.source) work.patch({ source, pages: [], step: "style" });
        await work.flush();
      } else {
        await work.create(titleOf(source, "Manga"), source);
        work.patch({ step: "style" });
      }
      router.push("/app/manga/style");
    } catch (e) {
      setError(message(e));
      setSending(false);
    }
  };

  return (
    <SourceStart
      key={editing?.id ?? "new"}
      tool="manga"
      steps={MANGA_STEPS}
      reached={editing?.step}
      label="Story"
      placeholder="Paste a story or a script passage"
      initial={editing?.source}
      sending={sending}
      error={error}
      onSubmit={submit}
    />
  );
}

function useCurrentManga() {
  const router = useRouter();
  const work = useMangas();
  useEffect(() => {
    if (!work.opening && !work.current && !work.openError) router.replace("/app/manga");
  }, [work.opening, work.current, work.openError, router]);
  return work;
}

/* ---------- Style ---------- */

export function MangaStyle() {
  const router = useRouter();
  const work = useCurrentManga();
  const saving = useSaveThen(work.flush);
  const manga = work.current;
  if (!manga) return <WorkLoading tool="manga" steps={MANGA_STEPS} step="style" error={work.openError} />;
  const chosen = manga.style ?? mangaStyles[0].slug;
  const count = (
    <div className={m.count} role="radiogroup" aria-label="Pages">
      <span className={m.countLabel} aria-hidden="true">
        Pages
      </span>
      {PAGE_COUNTS.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={manga.pageCount === c} className={m.countOption} onClick={() => work.patch({ pageCount: c })}>
          {c}
        </button>
      ))}
    </div>
  );
  return (
    <WorkShell
      tool="manga"
      view="create"
      steps={MANGA_STEPS}
      step="style"
      reached={manga.step}
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn
            kind="primary"
            loading={saving.busy}
            icon={<Icon name="generate" size={16} />}
            onClick={() => {
              work.patch({ style: chosen, pages: [], step: "pages" });
              void saving.go(() => router.push("/app/manga/pages"));
            }}
          >
            Generate
          </Btn>
        </SaveAction>
      }
    >
      <StylePicker groups={[{ items: mangaStyles }]} chosen={chosen} onChoose={(style) => work.patch({ style })} extra={count} />
    </WorkShell>
  );
}

/* ---------- Pages ---------- */

/** The pages, each with its lettering. A page is picked to see it large and edit its words; pages reorder by dragging or from the menu, and one can be drawn again. */
export function MangaPages() {
  const router = useRouter();
  const work = useCurrentManga();
  const saving = useSaveThen(work.flush);
  const manga = work.current;
  const pages = manga?.pages ?? [];
  const [making, setMaking] = useState(false);
  const [makeError, setMakeError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [redrawing, setRedrawing] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<number | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  /** The pages as they come in while they are made: the plan with its lettering first, then each page's art. */
  const [progress, setProgress] = useState<MangaPage[] | null>(null);
  const [redrawError, setRedrawError] = useState("");
  const asked = useRef("");
  /** Bumped by Try again, so a failed first draw runs again. */
  const [tries, setTries] = useState(0);
  const alive = useRef(true);
  const stop = useRef<AbortController | null>(null);
  const side = useRef<HTMLElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // Stopped only when the screen is really left: a remount straight after (React's development check) keeps it going.
      window.setTimeout(() => !alive.current && stop.current?.abort(), 0);
    };
  }, []);

  const id = manga?.id;
  const empty = Boolean(manga) && pages.length === 0;
  useEffect(() => {
    if (!manga || !empty || asked.current === manga.id) return;
    asked.current = manga.id;
    setMaking(true);
    setMakeError("");
    setProgress(null);
    stop.current?.abort();
    const s = new AbortController();
    stop.current = s;
    makeMangaPages({ source: manga.source, style: manga.style ?? mangaStyles[0].slug, pageCount: manga.pageCount, onPages: (p) => alive.current && setProgress(p) }, s.signal).then(
      ({ pages: made }) => {
        if (!alive.current) return;
        work.patch({ pages: made, step: "pages" });
        setSelected(made[0]?.id ?? null);
        setProgress(null);
        setMaking(false);
        setSaid("The pages are ready.");
      },
      (e: unknown) => {
        if (!alive.current || s.signal.aborted) return;
        setProgress(null);
        setMaking(false);
        setMakeError(message(e, "The pages did not come back. Try again."));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, empty, tries]);

  if (!manga) return <WorkLoading tool="manga" steps={MANGA_STEPS} step="pages" error={work.openError} />;

  const at = Math.max(0, pages.findIndex((p) => p.id === selected));
  const page = pages[at];
  const setPages = (next: MangaPage[]) => work.patch({ pages: next });
  const move = (pid: string, to: number) => {
    const from = pages.findIndex((p) => p.id === pid);
    if (from < 0 || to < 0 || to >= pages.length || from === to) return;
    const next = [...pages];
    const [p] = next.splice(from, 1);
    next.splice(to, 0, p);
    setPages(next);
    setSaid(`Page moved to ${to + 1}.`);
  };
  const letter = (pid: string, i: number, text: string) => setPages(pages.map((p) => (p.id === pid ? { ...p, letters: p.letters.map((l, j) => (j === i ? { ...l, text } : l)) } : p)));
  const redraw = (p: MangaPage) => {
    setRedrawing((s) => new Set(s).add(p.id));
    setRedrawError("");
    setSaid(`Drawing page ${pages.indexOf(p) + 1} again.`);
    regeneratePage({ page: p, style: manga.style ?? mangaStyles[0].slug, source: manga.source })
      .then(({ page: drawn }) => {
        if (!alive.current) return;
        const latest = work.current?.pages ?? [];
        work.patch({ pages: latest.map((x) => (x.id === p.id ? { ...x, image: drawn.image } : x)) });
        setSaid("Page drawn again.");
      })
      .catch((e: unknown) => {
        if (!alive.current) return;
        setSaid("That page did not come back. Try again.");
        setRedrawError(message(e, "That page did not come back. Try again."));
      })
      .finally(() => alive.current && setRedrawing((s) => (s.delete(p.id), new Set(s))));
  };
  const again = () => {
    asked.current = "";
    work.patch({ pages: [] });
    setTries((t) => t + 1);
  };
  const onDrop = (e: DragEvent, to: number) => {
    e.preventDefault();
    if (dragging) move(dragging, to);
    setDragging(null);
  };

  return (
    <WorkShell
      tool="manga"
      view="create"
      steps={MANGA_STEPS}
      step="pages"
      reached={manga.step}
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn
            kind="primary"
            disabled={making || pages.length === 0}
            loading={saving.busy}
            iconAfter={<Icon name="arrow" size={16} />}
            onClick={() => {
              work.patch({ step: "read" });
              void saving.go(() => router.push("/app/manga/read"));
            }}
          >
            Read
          </Btn>
        </SaveAction>
      }
    >
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className={m.layout}>
        <section className={m.list} aria-labelledby="pages-title">
          <h1 id="pages-title" className={b.title}>
            {manga.title}
          </h1>
          {makeError && (
            <div className={b.failed}>
              <Alert>{makeError}</Alert>
              <Btn kind="secondary" icon={<Icon name="replay" size={16} />} onClick={again}>
                Try again
              </Btn>
            </div>
          )}
          {redrawError && <Alert>{redrawError}</Alert>}
          <ol className={m.grid} aria-label="Pages" aria-busy={making || undefined}>
            {making && progress
              ? progress.map((p, i) => (
                  <li key={p.id} className={m.thumbItem}>
                    <span className={m.thumb}>
                      <Page page={p} n={i + 1} sizes="(max-width: 767px) 45vw, 200px" />
                    </span>
                    <span className={m.thumbName}>Page {i + 1}</span>
                  </li>
                ))
              : making
              ? Array.from({ length: manga.pageCount }, (_, i) => (
                  <li key={i} className={m.thumbItem}>
                    <span className={m.thumb}>
                      <span className={m.blank}>
                        <AsciiField mode="scan" cell={6} intensity={0.5} speed={1.15} className={b.glyphs} />
                      </span>
                    </span>
                    <Skeleton width="50%" height={16} radius={6} index={i} />
                  </li>
                ))
              : pages.map((p, i) => (
                  <li
                    key={p.id}
                    className={m.thumbItem}
                    data-dragging={dragging === p.id || undefined}
                    draggable
                    onDragStart={(e) => {
                      setDragging(p.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDragging(null)}
                    onDragOver={(e) => {
                      if (!dragging) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => onDrop(e, i)}
                  >
                    <button
                      type="button"
                      className={m.thumb}
                      aria-pressed={p.id === page?.id}
                      aria-label={`Page ${i + 1}`}
                      onClick={() => {
                        setSelected(p.id);
                        requestAnimationFrame(() => revealOnPhone(side.current));
                      }}
                    >
                      <Page page={p} n={i + 1} sizes="(max-width: 767px) 45vw, 200px" eager={i < 8} />
                      {redrawing.has(p.id) && (
                        <span className={m.blank} data-over="">
                          <AsciiField mode="scan" cell={6} intensity={0.5} speed={1.15} className={b.glyphs} />
                        </span>
                      )}
                    </button>
                    <span className={m.thumbName}>Page {i + 1}</span>
                  </li>
                ))}
          </ol>
        </section>

        <aside ref={side} className={m.side} aria-label={page ? `Page ${at + 1}` : "Page"}>
          {page && !making ? (
            <>
              <div className={m.sideHead}>
                <h2 className={m.sideTitle}>Page {at + 1}</h2>
                <Btn kind="ghost" small loading={redrawing.has(page.id)} icon={<Icon name="replay" size={16} />} onClick={() => redraw(page)}>
                  Regenerate
                </Btn>
                <Menu
                  label={`More for page ${at + 1}`}
                  items={[
                    { label: "Full screen", run: () => setViewing(at) },
                    ...(at > 0 ? [{ label: "Move earlier", run: () => move(page.id, at - 1) }] : []),
                    ...(at < pages.length - 1 ? [{ label: "Move later", run: () => move(page.id, at + 1) }] : []),
                  ]}
                />
              </div>
              <button type="button" className={m.large} onClick={() => setViewing(at)} aria-label={`Page ${at + 1}, full screen`}>
                <Page page={page} n={at + 1} sizes="(max-width: 900px) 100vw, 440px" eager />
              </button>
              <ul className={m.letters}>
                {page.letters.map((l, i) => (
                  <li key={i}>
                    <label className={m.letter}>
                      <span className={m.letterKind}>{KIND[l.kind]}</span>
                      <textarea className={m.letterText} rows={2} value={l.text} onChange={(e) => letter(page.id, i, e.target.value)} />
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Skeleton ratio="2 / 3" radius={12} />
          )}
        </aside>
      </div>
      <PageViewer pages={pages} at={viewing} onAt={setViewing} />
    </WorkShell>
  );
}

function PageViewer({ pages, at, onAt }: { pages: MangaPage[]; at: number | null; onAt: (n: number | null) => void }) {
  const page = at !== null ? pages[at] : undefined;
  return (
    <Preview
      open={Boolean(page)}
      shape="page"
      label={page ? `Page ${(at ?? 0) + 1}` : "Page"}
      onClose={() => onAt(null)}
      onPrev={at !== null && at > 0 ? () => onAt(at - 1) : undefined}
      onNext={at !== null && at < pages.length - 1 ? () => onAt(at + 1) : undefined}
    >
      {page && <Page page={page} n={(at ?? 0) + 1} sizes="100vw" eager />}
    </Preview>
  );
}

/* ---------- Read ---------- */

/** The manga as an open book: left and right pages meeting at a spine on wide screens, one under another on a phone. */
export function MangaRead() {
  const router = useRouter();
  const work = useCurrentManga();
  const saving = useSaveThen(work.flush);
  const [viewing, setViewing] = useState<number | null>(null);
  const manga = work.current;
  useEffect(() => {
    if (manga && manga.pages.length === 0 && !work.opening) router.replace("/app/manga/pages");
  }, [manga, work.opening, router]);
  if (!manga) return <WorkLoading tool="manga" steps={MANGA_STEPS} step="read" error={work.openError} />;
  return (
    <WorkShell
      tool="manga"
      view="create"
      steps={MANGA_STEPS}
      step="read"
      reached="read"
      action={
        <SaveAction error={saving.error}>
          <Btn kind="primary" icon={<Icon name="check" size={16} />} loading={saving.busy} onClick={() => void saving.go(() => router.push(LIBRARY))}>
            Done
          </Btn>
        </SaveAction>
      }
    >
      <div className={b.page}>
        <h1 className={b.title}>{manga.title}</h1>
        <div className={m.reader}>
          <ol className={m.spread} aria-label="Pages">
            {manga.pages.map((p, i) => (
              <li key={p.id} className={m.leaf}>
                <button type="button" className={m.leafButton} onClick={() => setViewing(i)} aria-label={`Page ${i + 1}, full screen`}>
                  <Page page={p} n={i + 1} sizes="(max-width: 900px) 100vw, 50vw" eager={i < 2} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <PageViewer pages={manga.pages} at={viewing} onAt={setViewing} />
    </WorkShell>
  );
}

/* ---------- Library ---------- */

export function MangaLibrary() {
  const router = useRouter();
  const work = useMangas();
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const open = async (id: string) => {
    setOpening(id);
    setError("");
    try {
      const t = await work.open(id);
      const to = { story: "/app/manga?edit=1", style: "/app/manga/style", pages: "/app/manga/pages", read: "/app/manga/read" }[t.step];
      router.push(to);
    } catch (e) {
      setError(message(e, "That manga did not open. Try again."));
      setOpening(null);
    }
  };
  return (
    <WorkShell
      tool="manga"
      view="library"
      steps={MANGA_STEPS}
      action={
        <Btn
          kind="primary"
          icon={<GestureIcon name="plus" size={18} />}
          onClick={() => {
            work.clear();
            router.push("/app/manga");
          }}
        >
          New
        </Btn>
      }
    >
      <WorkCards
        title="Library"
        loading={!work.listed}
        error={error}
        items={work.list.map((t) => ({ id: t.id, title: t.title, cover: t.pages[0]?.image }))}
        opening={opening}
        onOpen={(id) => void open(id)}
        onDelete={(id) => work.remove(id).catch((e: unknown) => setError(message(e, "That did not delete. Try again.")))}
        empty={
          <Link href="/app/manga" className={b.emptyLink} onClick={() => work.clear()}>
            New manga
          </Link>
        }
      />
    </WorkShell>
  );
}
