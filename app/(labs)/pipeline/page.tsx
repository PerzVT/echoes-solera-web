import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { Clip } from "@/components/labs/pipeline/Clip";
import { FunctionRow } from "@/components/labs/pipeline/FunctionRow";
import s from "@/components/labs/pipeline/pipeline.module.css";
import { StepFigure } from "@/components/labs/pipeline/StepFigure";
import { getFunction, hero, overview, steps, type PipelineFunction } from "@/lib/labs/pipeline";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Pipeline", ...og("Pipeline") };

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-screenplay",
  display: "swap",
});

export default function Pipeline() {
  return (
    <div className={`${s.page} ${courier.variable}`} data-backdrop="medium">
      <Nav />
      <main id="main" className={s.main}>
        <section className={s.hero} aria-labelledby="title">
          <div className={s.heroCopy}>
            <h1 id="title" className="display">
              {overview.title}
            </h1>
            <p className={s.lede}>{overview.intro}</p>
            <div className={s.halves}>
              {overview.halves.map((h) => (
                <div key={h.title} className={s.half}>
                  <h2 className="h3">{h.title}</h2>
                  <p className="muted">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
          <figure className={s.heroClip}>
            <Clip className={s.clip} src={hero.clip.src} poster={hero.clip.poster} label={hero.clip.label} />
            <figcaption className={s.caption}>{hero.clip.label}.</figcaption>
          </figure>
        </section>

        <section className={s.walk} aria-labelledby="walk">
          <h2 id="walk" className={`h1 ${s.walkTitle}`}>
            One scene, end to end
          </h2>

          <nav className={s.index} aria-label="Steps">
            <ol>
              {steps.map((st, i) => (
                <li key={st.slug}>
                  <a href={`#${st.slug}`}>
                    <span className={s.indexNum}>{i + 1}</span>
                    {st.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <ol className={s.steps}>
            {steps.map((st, i) => {
              const fns = st.functions.map(getFunction).filter((f): f is PipelineFunction => Boolean(f));
              return (
                <Reveal
                  as="li"
                  key={st.slug}
                  id={st.slug}
                  className={s.step}
                  data-side={i % 2 ? "left" : "right"}
                  data-figure={st.figure ? "true" : "false"}
                >
                  {i > 0 && <div className={s.thread} aria-hidden="true" />}
                  <div className={s.stepCopy}>
                    <span className={s.num} aria-hidden="true">
                      {i + 1}
                    </span>
                    <h3 className="h2">{st.title}</h3>
                    {st.text.map((p) => (
                      <p key={p.slice(0, 32)} className={s.stepText}>
                        {p}
                      </p>
                    ))}
                    <ul className={s.fnList} aria-label={`Functions used to ${st.title.toLowerCase()}`}>
                      {fns.map((fn) => (
                        <FunctionRow key={fn.slug} fn={fn} />
                      ))}
                    </ul>
                  </div>
                  {st.figure && (
                    <div className={s.stepFigure}>
                      <StepFigure figure={st.figure} />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </ol>
        </section>

        <Reveal as="section" className={s.end} aria-labelledby="end">
          <div>
            <h2 id="end" className="h2">
              See it in the creator
            </h2>
            <p className="muted">The creator has one screen for each stage: script, screenplay, references and results.</p>
          </div>
          <div className={s.endActions}>
            <ButtonLink href="/app">Open the creator</ButtonLink>
            <ButtonLink href="/lab" variant="secondary">
              Go to the lab
            </ButtonLink>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
