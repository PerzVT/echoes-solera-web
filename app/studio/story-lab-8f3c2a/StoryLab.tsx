"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { chapters as seedChapters, seriesTitle, type Chapter } from "./storyData";
import s from "./story.module.css";
import { readMedia, storeMedia } from "./browserStorage";

type Point = { x: number; y: number };
type View = Point & { scale: number };
type Series = { id: string; title: string };
const defaultSeries: Series = { id: "gray-winter", title: seriesTitle };
const seriesKey = "story-lab-series-v1";
const selectedSeriesKey = "story-lab-selected-series-v1";
const keyFor = (id: string) => id === "gray-winter" ? "story-lab-gray-winter-document-v1" : "story-lab-series-" + id;
function firstChapters(series: Series): Chapter[] {
  return series.id === "gray-winter" ? seedChapters : [{ id: series.id + "-1", number: "01", title: "Episode 1", story: "", summary: "", kind: "episode", x: 0, y: 0, clips: [], choices: [] }];
}
const clamp = (n: number) => Math.min(1.6, Math.max(.25, n));
const size = (_c: Chapter) => ({ w: 216, h: 384 });


// Keep sibling outcomes together, with each parent centered on its own branches.
function layoutTree(chapters: Chapter[]): Record<string, Point> {
  const result: Record<string, Point> = {};
  const targets = new Set(chapters.flatMap(chapter => chapter.choices.map(choice => choice.to)));
  let row = 0;
  function place(id: string, depth: number): number {
    if (result[id]) return result[id].y;
    const chapter = chapters.find(item => item.id === id)!;
    result[id] = { x: depth * 480, y: 0 };
    const children = chapter.choices.map(choice => place(choice.to, depth + 1));
    const y = children.length ? (children[0] + children[children.length - 1]) / 2 : row++ * 464;
    result[id].y = y;
    return y;
  }
  chapters.filter(chapter => !targets.has(chapter.id)).forEach(chapter => place(chapter.id, 0));
  return result;
}

function connector(start: Point, end: Point, bottom: number) {
  const gap = end.x - start.x;
  if (gap >= 80) {
    const reach = Math.max(60, gap * .5);
    return `M${start.x},${start.y} C${start.x + reach},${start.y} ${end.x - reach},${end.y} ${end.x},${end.y}`;
  }
  // When a card is moved behind its parent, carry the connection beneath both cards.
  const detour = bottom + 72;
  const mid = (start.x + end.x) / 2;
  return `M${start.x},${start.y} C${start.x + 100},${start.y} ${start.x + 100},${detour} ${mid},${detour} S${end.x - 100},${end.y} ${end.x},${end.y}`;
}

function Icon({ name }: { name: "play" | "close" | "fit" | "reset" | "minus" | "plus" | "arrow" }) {
  const paths = { play: "m9 5 11 7-11 7Z", close: "m6 6 12 12M6 18 18 6", fit: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5", reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6", minus: "M5 12h14", plus: "M5 12h14M12 5v14", arrow: "M4 12h15m-6-6 6 6-6 6" };
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={name === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export default function StoryLab() {
  const [series, setSeries] = useState<Series[]>([defaultSeries]);
  const [selectedId, setSelectedId] = useState(defaultSeries.id);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(seriesKey) || "[]") as Series[];
      const catalog = [defaultSeries, ...saved.filter(item => item.id !== defaultSeries.id && typeof item.title === "string" && /^[a-f0-9-]{36}$/.test(item.id))];
      setSeries(catalog);
      const last = localStorage.getItem(selectedSeriesKey);
      if (catalog.some(item => item.id === last)) setSelectedId(last!);
    } catch { /* The original series remains available if browser storage is unavailable. */ }
  }, []);
  function select(id: string) {
    try { localStorage.setItem(selectedSeriesKey, id); } catch { /* Selection can still change. */ }
    setSelectedId(id);
  }
  function create(title: string) {
    const next = { id: crypto.randomUUID(), title: title.trim() };
    if (!next.title) return;
    const catalog = [...series, next];
    localStorage.setItem(keyFor(next.id), JSON.stringify(firstChapters(next)));
    localStorage.setItem(seriesKey, JSON.stringify(catalog));
    setSeries(catalog); select(next.id);
  }
  const current = series.find(item => item.id === selectedId) || defaultSeries;
  return <SeriesBoard key={current.id} series={current} catalog={series} onSelect={select} onCreate={create} />;
}

function SeriesBoard({ series, catalog, onSelect, onCreate }: { series: Series; catalog: Series[]; onSelect: (id: string) => void; onCreate: (title: string) => void }) {
  const startingChapters = firstChapters(series);
  const documentKey = keyFor(series.id);
  const initial = layoutTree(startingChapters);
  const [addingSeries, setAddingSeries] = useState(false);
  const [seriesName, setSeriesName] = useState("");
  const [seriesError, setSeriesError] = useState("");
  const [chapters, setChapters] = useState(startingChapters.map(c => ({ ...c, story: c.story.replace(/^Proposed outcome:\s*/i, "") })));
  const nodes = useRef(chapters);
  const byId = new Map(chapters.map(c => [c.id, c]));
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const urls = useRef<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [addingBranch, setAddingBranch] = useState(false);
  const [preview, setPreview] = useState(false);
  const uploadInput = useRef<HTMLInputElement>(null);
  const [positions, setPositions] = useState<Record<string, Point>>(initial);
  const points = useRef(positions);

  const navigator = useRef<HTMLDetailsElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Chapter | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);
  const [ratio, setRatio] = useState(9 / 16);
  const board = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const gesture = useRef<{ pointerId: number; start: Point; origin: Point; id?: string; scale: number; moved: boolean } | null>(null);

  const fit = useCallback((all = true) => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) return;
    const fitting = all ? nodes.current : nodes.current.filter(c => c.kind !== "draft");
    const minX = Math.min(...fitting.map(c => points.current[c.id].x));
    const minY = Math.min(...fitting.map(c => points.current[c.id].y));
    const width = Math.max(...fitting.map(c => points.current[c.id].x + size(c).w)) - minX;
    const height = Math.max(...fitting.map(c => points.current[c.id].y + size(c).h)) - minY;
    const scale = clamp(Math.min((rect.width - 100) / width, (rect.height - 160) / height, .9));
    setView({ x: (rect.width - width * scale) / 2 - minX * scale, y: all ? (rect.height - height * scale) / 2 - minY * scale : 140 - minY * scale, scale });
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const raw = localStorage.getItem(documentKey);
        const saved: Chapter[] = raw ? JSON.parse(raw) : startingChapters;
        if (!Array.isArray(saved) || !saved.length) throw new Error("Saved story could not be opened.");
        const locations = raw ? Object.fromEntries(saved.map(c => [c.id, { x: c.x, y: c.y }])) : layoutTree(saved);
        const media: Record<string, string> = {};
        const ids = [...new Set(saved.flatMap(c => [c.poster, ...c.clips.map(clip => clip.url)]).filter((url): url is string => Boolean(url?.startsWith("local-media:"))))];
        for (const id of ids) {
          const file = await readMedia(id);
          if (file) { const url = URL.createObjectURL(file); urls.current.push(url); media[id] = url; }
        }
        if (cancelled) return;
        nodes.current = saved; setChapters(saved); setMediaUrls(media);
        points.current = locations; setPositions(locations); setLoaded(true); fit();
      } catch { if (!cancelled) setMessage("Could not load browser saves. Reload to retry."); }
    }
    void load();
    return () => { cancelled = true; urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current = []; };
  }, [fit]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);
  useEffect(() => {
if (board.current!.clientWidth < 650) setView({ x: 32, y: 80, scale: .85 }); else fit(); setReady(true);
    let previous = board.current!.getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      const next = board.current!.getBoundingClientRect();
      setView(v => ({ ...v, x: v.x + (next.width - previous.width) / 2, y: v.y + (next.height - previous.height) / 2 }));
      previous = next;
    });
    observer.observe(board.current!);
    return () => observer.disconnect();
  }, [fit]);
  useEffect(() => {
    const element = board.current!;
    function wheel(event: WheelEvent) {
      event.preventDefault();
      if (gesture.current) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
      if (event.ctrlKey || event.metaKey) {
        const rect = element.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
        setView(v => { const scale = clamp(v.scale * Math.exp(-event.deltaY * unit * .01)); return { scale, x: x - (x - v.x) * scale / v.scale, y: y - (y - v.y) * scale / v.scale }; });
      } else setView(v => ({ ...v, x: v.x - (event.shiftKey ? event.deltaY : event.deltaX) * unit, y: v.y - (event.shiftKey ? 0 : event.deltaY) * unit }));
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);
  useEffect(() => {
    if (!active) return;
    setError(false); setRatio(9 / 16);
    if (!dialog.current?.open) dialog.current?.showModal();
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [active?.id]);

  useEffect(() => {
    function dismiss(event: globalThis.PointerEvent) {
      if (navigator.current && !navigator.current.contains(event.target as Node)) navigator.current.open = false;
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  function showSeries() {
    setSelected(null);
    if (navigator.current) navigator.current.open = false;
    fit();
  }
  async function open(chapter: Chapter) {
    if (busy || (dirty && !(await saveChapter()))) return;
    setDirty(false); setPreview(false); setMessage(""); setAddingBranch(false); setBranchName("");
    if (!dialog.current?.open) returnFocus.current = board.current?.querySelector<HTMLElement>(`[data-node="${chapter.id}"]`) ?? null;
    setSelected(chapter.id); setActive(chapter);
    setVisited(previous => previous.includes(chapter.id) ? previous : [...previous, chapter.id]);
  }
  async function close() {
    if (busy || (dirty && !(await saveChapter()))) return;
    dialog.current?.querySelector("video")?.pause(); dialog.current?.close(); setActive(null);
    returnFocus.current?.focus({ preventScroll: true });
  }
  function save() { if (loaded && !busy) void persist(nodes.current); }
  function move(id: string, point: Point) { points.current = { ...points.current, [id]: point }; setPositions(points.current); }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!loaded || busy || event.button !== 0 || !event.isPrimary || gesture.current) return;
    const id = (event.target as HTMLElement).closest<HTMLElement>("[data-node]")?.dataset.node;
    gesture.current = { pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: id ? points.current[id] : view, id, scale: view.scale, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    const dx = event.clientX - g.start.x, dy = event.clientY - g.start.y;
    if (Math.hypot(dx, dy) < 5 && !g.moved) return;
    g.moved = true; setDragging(true);
    if (g.id) { setSelected(g.id); move(g.id, { x: g.origin.x + dx / g.scale, y: g.origin.y + dy / g.scale }); }
    else setView(v => ({ ...v, x: g.origin.x + dx, y: g.origin.y + dy }));
  }
  function cancelGesture() { if (gesture.current?.moved) save(); gesture.current = null; setDragging(false); }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    cancelGesture();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (g.id && !g.moved) open(byId.get(g.id)!);
  }
  function zoom(factor: number) {
    const rect = board.current?.getBoundingClientRect(); if (!rect) return;
    setView(v => { const scale = clamp(v.scale * factor); return { scale, x: rect.width / 2 - (rect.width / 2 - v.x) * scale / v.scale, y: rect.height / 2 - (rect.height / 2 - v.y) * scale / v.scale }; });
  }


  function edit(patch: Partial<Chapter>) {
    setActive(previous => previous ? { ...previous, ...patch } : null);
    setDirty(true); setMessage("");
  }
  async function persist(next: Chapter[]) {
    if (!loaded) { setMessage("Wait for the saved story to load."); return false; }
    setBusy(true); setMessage("");
    try {
      const payload = next.map(chapter => ({ ...chapter, ...(points.current[chapter.id] || { x: chapter.x, y: chapter.y }) }));
      localStorage.setItem(documentKey, JSON.stringify(payload));
      const nextPositions = Object.fromEntries(payload.map(c => [c.id, { x: c.x, y: c.y }]));
      points.current = nextPositions; setPositions(nextPositions);
      nodes.current = payload; setChapters(payload);
      setDirty(false); setMessage("Saved in this browser"); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save. Browser storage may be full."); return false; }
    finally { setBusy(false); }
  }
  async function saveChapter() {
    if (!active || !active.title.trim()) { setMessage("Give this card a title."); return false; }
    return persist(chapters.map(chapter => chapter.id === active.id ? active : chapter));
  }
  async function addBranch() {
    if (!active || !branchName.trim()) return;
    if (!active.title.trim()) { setMessage("Give this card a title."); return; }
    const id = crypto.randomUUID();
    const parent = points.current[active.id];
    let y = parent.y + active.choices.length * 464;
    const x = parent.x + 480;
    while (Object.values(points.current).some(p => Math.abs(p.x - x) < 240 && Math.abs(p.y - y) < 420)) y += 464;
    const child: Chapter = { id, number: "", title: branchName.trim(), summary: "", story: "", kind: "draft", x, y, clips: [], choices: [] };
    const updated = { ...active, choices: [...active.choices, { label: branchName.trim(), to: id, draft: true }] };
    if (await persist([...chapters.map(chapter => chapter.id === active.id ? updated : chapter), child])) {
      points.current = { ...points.current, [id]: { x, y } }; setPositions(points.current);
      setActive(child); setSelected(id); setAddingBranch(false); setBranchName(""); setPreview(false);
    }
  }
  async function upload(file: File) {
    if (!active) return;
    if (file.size > 200 * 1024 * 1024) { setMessage("Choose a file under 200 MB."); return; }
    setBusy(true); setMessage("Uploading…");
    try {
      if (!["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a video or image file.");
      const id = "local-media:" + crypto.randomUUID();
      await storeMedia(id, file);
      const url = URL.createObjectURL(file); urls.current.push(url);
      setMediaUrls(previous => ({ ...previous, [id]: url }));
      edit(file.type.startsWith("video/") ? { clips: [{ id: crypto.randomUUID(), title: file.name, url: id }], poster: undefined } : { poster: id, clips: [] });
      setPreview(false); setError(false); setRatio(9 / 16);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  return <main className={s.shell}>
    <nav className={s.topbar} aria-label="Narrative navigation">
      <button className={s.boardName} onClick={() => showSeries()} aria-label="Show full narrative"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h7.5V14M6.5 10v7.5H14"/></svg><strong>Story Lab</strong></button>
      <details ref={navigator} className={s.pagePicker} onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
        <summary><span>{series.title}</span><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary>
        <div className={s.pageMenu}>
          <p>Series</p>
          <div className={s.seriesList}>{catalog.map(item => <button key={item.id} aria-current={series.id === item.id ? "page" : undefined} disabled={busy} onClick={() => { if (navigator.current) navigator.current.open = false; if (series.id === item.id) showSeries(); else onSelect(item.id); }}>{item.title}{series.id === item.id && <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>}</button>)}</div>
          {addingSeries ? <form className={s.seriesForm} onSubmit={event => { event.preventDefault(); try { onCreate(seriesName); } catch { setSeriesError("Could not save this series. Browser storage may be full."); } }}>
            <input autoFocus aria-label="Series name" placeholder="Series name" maxLength={120} value={seriesName} onChange={event => setSeriesName(event.target.value)} />
            <div><button type="button" onClick={() => { setAddingSeries(false); setSeriesError(""); }}>Cancel</button><button type="submit" disabled={!seriesName.trim()}>Create series</button></div>
            {seriesError && <p role="alert">{seriesError}</p>}
          </form> : <button className={s.addSeries} disabled={!loaded || busy} onClick={() => { setAddingSeries(true); setSeriesName(""); }}>+ Add series</button>}
        </div>
      </details>
    </nav>
    <div ref={board} className={s.board} tabIndex={0} data-dragging={dragging} aria-label="Story canvas. Drag the background to pan. Drag cards to move them. Alt and arrow keys move a focused card."
      style={{ backgroundPosition: `${view.x}px ${view.y}px`, backgroundSize: `${28 * view.scale}px ${28 * view.scale}px` }}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancelGesture} onLostPointerCapture={cancelGesture}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const offsets: Record<string, Point> = { ArrowLeft: { x: 60, y: 0 }, ArrowRight: { x: -60, y: 0 }, ArrowUp: { x: 0, y: 60 }, ArrowDown: { x: 0, y: -60 } };
        const offset = offsets[event.key];
        if (offset) { event.preventDefault(); setView(v => ({ ...v, x: v.x + offset.x, y: v.y + offset.y })); }
        if (event.key === "0") fit();
      }}>
      <div className={s.canvas} data-ready={ready} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        <svg className={s.connections} aria-hidden="true">
          <defs><marker id="story-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M2 1 6 5 2 9" fill="none" stroke="context-stroke" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
          {chapters.flatMap(chapter => chapter.choices.map((choice, index) => {
            const from = positions[chapter.id], to = positions[choice.to], destination = byId.get(choice.to)!;
            const a = size(chapter), b = size(destination);
            const sx = from.x + a.w, sy = from.y + a.h * (index + 1) / (chapter.choices.length + 1);
            const ex = to.x, ey = to.y + b.h / 2;

            return <g key={chapter.id + choice.to} data-highlighted={selected === chapter.id || selected === choice.to}>
              <path d={connector({ x: sx, y: sy }, { x: ex, y: ey }, Math.max(from.y + a.h, to.y + b.h))} markerEnd="url(#story-arrow)" />
              <circle cx={sx} cy={sy} r="3" />
              
            </g>;
          }))}
        </svg>
        {chapters.map(chapter => <button key={chapter.id} data-node={chapter.id} data-selected={selected === chapter.id} data-visited={visited.includes(chapter.id)} data-kind={chapter.kind} data-media={Boolean(chapter.clips.length)} className={s.card}
          style={{ left: positions[chapter.id].x, top: positions[chapter.id].y, width: size(chapter).w, height: size(chapter).h }}
          onClick={event => { if (event.detail === 0) open(chapter); }}
          onKeyDown={event => {
            if (!event.altKey) return;
            const offsets: Record<string, Point> = { ArrowLeft: { x: -16, y: 0 }, ArrowRight: { x: 16, y: 0 }, ArrowUp: { x: 0, y: -16 }, ArrowDown: { x: 0, y: 16 } };
            const delta = offsets[event.key]; if (delta) { event.preventDefault(); move(chapter.id, { x: positions[chapter.id].x + delta.x, y: positions[chapter.id].y + delta.y }); save(); }
          }} aria-label={`${chapter.kind === "episode" ? "Episode " + chapter.number : "Draft " + chapter.number}: ${chapter.title}`}>
          <img className={s.thumbnail} src={(chapter.poster && (mediaUrls[chapter.poster] || chapter.poster)) || "/story-lab/gray-winter/placeholder.svg"} alt="" draggable={false} />
          <span className={s.cardBottom}><span className={s.title}>{chapter.title}</span></span>
        </button>)}
      </div>
    </div>
    {!active && message && <div className={s.notice} role="status">{message}</div>}
    <div className={s.controls} aria-label="Canvas controls">
      <button onClick={() => zoom(1 / 1.2)} aria-label="Zoom out" disabled={view.scale <= .25}><Icon name="minus" /></button><span>{Math.round(view.scale * 100)}%</span>
      <button onClick={() => zoom(1.2)} aria-label="Zoom in" disabled={view.scale >= 1.6}><Icon name="plus" /></button><i />
      <button onClick={() => fit()} aria-label="Fit all nodes" title="Fit all nodes"><Icon name="fit" /></button>
      <button onClick={() => { const reset = layoutTree(chapters); points.current = reset; setPositions(reset); save(); setSelected(null); setVisited([]); fit(); }} aria-label="Reset layout" title="Reset layout"><Icon name="reset" /></button>
    </div>
    <dialog ref={dialog} className={s.dialog} data-has-video={Boolean(active?.clips.length)} aria-label={active?.title ?? "Episode"} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      {active && <div className={s.playerLayout} style={{ "--media-ratio": ratio } as CSSProperties}>
        <button className={s.close} onClick={close} aria-label="Close episode"><Icon name="close" /></button>
        <div className={s.mediaColumn}>
          <div className={s.screen}>
            {active.clips.length ? <video key={active.clips[0].url} src={mediaUrls[active.clips[0].url] || active.clips[0].url} controls={preview} playsInline preload="metadata" poster={active.poster ? mediaUrls[active.poster] || active.poster : undefined} onLoadedMetadata={event => { const v = event.currentTarget; if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight); }} onError={() => setError(true)} aria-label={active.title} /> : <img className={s.placeholder} src={(active.poster && (mediaUrls[active.poster] || active.poster)) || "/story-lab/gray-winter/placeholder.svg"} alt="" />}
            {active.clips.length > 0 && !preview && <button className={s.preview} aria-label="Play video" onClick={() => { setPreview(true); void dialog.current?.querySelector("video")?.play(); }}><Icon name="play" /></button>}
            {error && <span className={s.error}>Video unavailable.</span>}
          </div>
          <input ref={uploadInput} type="file" hidden accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
          <button className={s.upload} disabled={busy || !loaded} onClick={() => uploadInput.current?.click()}>{active.clips.length || active.poster ? "Replace media" : "Upload media"}</button>
        </div>
        <div className={s.editor}>
          <input className={s.editTitle} aria-label="Card title" value={active.title} maxLength={160} disabled={busy} onChange={event => edit({ title: event.target.value })} />
          <textarea className={s.editStory} aria-label="Story" value={active.story} maxLength={30000} disabled={busy} placeholder="Write the story…" onChange={event => edit({ story: event.target.value })} />
          <div className={s.branchEditor}>{active.choices.map((choice, index) => <div className={s.branchRow} key={choice.to}>
            <input aria-label={"Branch " + (index + 1)} value={choice.label} maxLength={200} disabled={busy} onChange={event => edit({ choices: active.choices.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
            <button aria-label={"Open " + (byId.get(choice.to)?.title || "outcome")} disabled={busy} onClick={() => void open(byId.get(choice.to)!)}><Icon name="arrow" /></button>
          </div>)}</div>
          {addingBranch ? <form className={s.newBranch} onSubmit={event => { event.preventDefault(); void addBranch(); }}><input autoFocus aria-label="New branch title" placeholder="Branch title" maxLength={160} value={branchName} disabled={busy} onChange={event => setBranchName(event.target.value)} /><button disabled={busy || !branchName.trim()}>Add</button><button type="button" disabled={busy} onClick={() => setAddingBranch(false)}>Cancel</button></form> : <button className={s.addBranch} disabled={busy || !loaded} onClick={() => setAddingBranch(true)}>+ Add branch</button>}
          <div className={s.editorFooter}><span role="status">{message || (dirty ? "Unsaved changes" : "")}</span><button className={s.saveButton} disabled={busy || !loaded || !dirty} onClick={() => void saveChapter()}>{busy ? "Saving…" : "Save"}</button></div>
        </div>
      </div>}
    </dialog>
  </main>;
}


