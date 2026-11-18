"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AsciiField, MediaFrame, PlayPauseIcon, VolumeIcon } from "@/components/labs/fx";
import { Icon } from "@/components/labs/Icon";
import { Btn } from "../chat/ui";
import { makeCookingTake } from "@/components/labs/app/generate";
import { Alert } from "@/components/labs/app/parts";
import { chefSrc, clock, lengthOf, seconds, type Recipe, type Video } from "./data";
import type { Made as VideoMade } from "@/lib/labs/store/types";
import { useCooking } from "./store";
import r from "./result.module.css";

type Verdict = "approved" | "denied" | null;

/** One generation on the page that made it: it develops, then plays large, to approve, deny or retry with feedback. */
export function Result({ recipe, chef, style, onAnother }: { recipe: Recipe; chef: string; style: { slug: string; name: string }; onAnother: () => void }) {
  const { approve } = useCooking();
  const [take, setTake] = useState(0);
  const [ready, setReady] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [retry, setRetry] = useState(false);
  const [feedback, setFeedback] = useState("");
  /** The feedback the take being made was asked for with. */
  const [asked, setAsked] = useState("");
  const [made, setMade] = useState<{ video: string; poster: string; made?: VideoMade } | null>(null);
  const [error, setError] = useState("");
  const another = useRef<HTMLButtonElement>(null);
  const clip = made ?? { video: "", poster: "" };

  // Each take is made through the creator's generation module; it develops until it comes back.
  useEffect(() => {
    if (ready || error) return;
    const stop = new AbortController();
    makeCookingTake({ recipe: recipe.title, chef, style, take, feedback: asked }, stop.signal).then(
      (r) => {
        setMade(r);
        setReady(true);
      },
      (e: unknown) => {
        if (stop.signal.aborted) return;
        setError(e instanceof Error && e.message ? e.message : "This take did not come back. Try again.");
      },
    );
    return () => stop.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, take, error]);

  useEffect(() => {
    if (verdict) another.current?.focus();
  }, [verdict]);

  const decide = (v: Exclude<Verdict, null>) => {
    setVerdict(v);
    setRetry(false);
    if (v === "approved") {
      const video: Video = {
        id: `made-${recipe.key}-${take}-${Date.now()}`,
        title: recipe.title,
        chef,
        seconds: lengthOf(recipe),
        video: clip.video,
        poster: clip.poster,
        recipeKey: recipe.key,
        style: style.slug,
        status: "ready",
        made: made?.made,
      };
      approve(video);
    }
  };

  return (
    <div className={r.result}>
      <div className={r.stage}>
        <Player key={take} video={clip.video} poster={clip.poster} title={recipe.title} ready={ready} failed={!!error} />
      </div>
      <div className={r.side}>
        <h1 className={r.title}>{recipe.title}</h1>
        <dl className={r.settings}>
          <div>
            <dt>Chef</dt>
            <dd className={r.chefVal}>
              {chefSrc(chef) && (
                <span className={r.avatar}>
                  <Image src={chefSrc(chef)!} alt="" fill sizes="48px" />
                </span>
              )}
              {chef}
            </dd>
          </div>
          <div>
            <dt>Style</dt>
            <dd>{style.name}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{seconds(lengthOf(recipe))}</dd>
          </div>
          {take > 0 && (
            <div>
              <dt>Take</dt>
              <dd>{take + 1}</dd>
            </div>
          )}
        </dl>

        {verdict ? (
          <div className={r.actions}>
            <p className={r.verdict} data-verdict={verdict} role="status">
              <Icon name={verdict === "approved" ? "check" : "close"} size={16} />
              {verdict === "approved" ? "Approved" : "Denied"}
            </p>
            <div className={r.dock}>
              <Btn ref={another} kind="primary" wide icon={<Icon name="generate" size={16} />} onClick={onAnother}>
                Make another
              </Btn>
            </div>
          </div>
        ) : (
          <div className={r.actions}>
            <div className={r.dock}>
              <div className={r.pair}>
                <Btn kind="primary" icon={<Icon name="check" size={16} />} disabled={!ready} onClick={() => decide("approved")}>
                  Approve
                </Btn>
                <Btn kind="secondary" icon={<Icon name="close" size={16} />} disabled={!ready} onClick={() => decide("denied")}>
                  Deny
                </Btn>
              </div>
            </div>
            {error && (
              <>
                <Alert>{error}</Alert>
                <Btn kind="secondary" icon={<Icon name="replay" size={16} />} onClick={() => setError("")}>
                  Try again
                </Btn>
              </>
            )}
            {retry ? (
              <form
                className={r.retry}
                onSubmit={(e) => {
                  e.preventDefault();
                  setRetry(false);
                  setAsked(feedback);
                  setFeedback("");
                  setMade(null);
                  setReady(false);
                  setTake((t) => t + 1);
                }}
              >
                <textarea
                  autoFocus
                  className={r.feedback}
                  aria-label="Feedback for the new take"
                  placeholder="What should change?"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                    if (e.key === "Escape") setRetry(false);
                  }}
                />
                <div className={r.retryRow}>
                  <Btn kind="ghost" small icon={<Icon name="close" size={16} />} onClick={() => setRetry(false)}>
                    Cancel
                  </Btn>
                  <Btn kind="secondary" small icon={<Icon name="send" size={16} />} type="submit">
                    Send
                  </Btn>
                </div>
              </form>
            ) : (
              <Btn kind="ghost" icon={<Icon name="replay" size={16} />} disabled={!ready} onClick={() => setRetry(true)}>
                Retry with feedback
              </Btn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Player({ video, poster, title, ready, failed }: { video: string; poster: string; title: string; ready: boolean; failed: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [wasReady, setWasReady] = useState(ready);
  if (wasReady !== ready) {
    setWasReady(ready);
    if (ready) setLeaving(true);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLeaving(false), 700);
    return () => clearTimeout(t);
  }, [leaving]);
  useEffect(() => {
    if (ready) ref.current?.play().catch(() => {});
  }, [ready]);
  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  return (
    <div className={r.screen} aria-busy={!ready}>
      {ready ? (
        <MediaFrame fill>
          <video ref={ref} src={video} poster={poster || undefined} muted={muted} playsInline loop preload="auto" onClick={toggle} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} aria-label={title} />
        </MediaFrame>
      ) : (
        poster && <Image src={poster} alt="" fill sizes="480px" className={r.under} />
      )}
      {((!ready && !failed) || leaving) && (
        <span className={r.develop} data-leaving={leaving || undefined}>
          <AsciiField mode="scan" cell={8} intensity={0.55} speed={1.15} className={r.glyphs} />
        </span>
      )}
      {ready && video && (
        <div className={r.controls}>
          <button type="button" className={r.over} onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            <PlayPauseIcon playing={playing} size={18} />
            <span className={r.time}>{clock(time)}</span>
          </button>
          <button type="button" className={r.over} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
            <VolumeIcon muted={muted} size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
