import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import s from "@/components/labs/pipeline/pipeline.module.css";
import { StepFigure } from "@/components/labs/pipeline/StepFigure";
import { chapters, functions, getFunction, neighbours, stepOf, surfaceHref } from "@/lib/labs/pipeline";
import { og } from "@/lib/labs/og";

type Params = { params: Promise<{ function: string }> };

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400"], variable: "--font-screenplay", display: "swap" });

export function generateStaticParams() {
  return functions.map((f) => ({ function: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const fn = getFunction((await params).function);
  if (!fn) return { title: "Page not found" };
  return { title: fn.title, ...og(fn.title) };
}

export default async function FunctionPage({ params }: Params) {
  const fn = getFunction((await params).function);
  if (!fn) notFound();
  const { prev, next } = neighbours(fn.slug);
  const step = stepOf(fn.slug);
  const figure = step?.figure;
  const surface = fn.surface === "Style hub" ? "the Style hub" : `the ${fn.surface.toLowerCase()} screen`;

  return (
    <div className={`${s.page} ${courier.variable}`}>
      <Nav />
      <div className={s.fnPage}>
        <nav className={s.toc} aria-label="Pipeline functions">
          <ol>
            <li>
              <Link href="/pipeline">Pipeline</Link>
            </li>
            {chapters.map((c) => {
              const open = c.slug === fn.chapter;
              const first = functions.find((f) => f.chapter === c.slug);
              return (
                <li key={c.slug} data-open={open}>
                  <Link href={`/pipeline/${first?.slug ?? ""}`}>{c.title}</Link>
                  {open && (
                    <ol>
                      {functions
                        .filter((f) => f.chapter === c.slug)
                        .map((f) => (
                          <li key={f.slug}>
                            <Link href={`/pipeline/${f.slug}`} aria-current={f.slug === fn.slug ? "page" : undefined}>
                              {f.title}
                            </Link>
                          </li>
                        ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <main id="main" className={s.article} data-figure={figure ? "true" : "false"}>
          <div className={s.titleBlock}>
            <h1 className="h1">{fn.title}</h1>
            <p className={s.lede}>{fn.purpose}</p>
          </div>

          {figure && (
            <div className={s.articleFigure}>
              <StepFigure figure={figure} compact />
            </div>
          )}

          <div className={s.io}>
            <section>
              <h2 className="h3">What goes in</h2>
              <p>{fn.input}</p>
            </section>
            <section>
              <h2 className="h3">What happens</h2>
              <p>{fn.process}</p>
            </section>
            <section>
              <h2 className="h3">What comes out</h2>
              <p>{fn.output}</p>
            </section>
            <section>
              <h2 className="h3">What it catches</h2>
              <ul className={s.catches}>
                {fn.checks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className={s.example} aria-labelledby="example">
            <h2 id="example" className="h3">
              Example
            </h2>
            <p>{fn.example}</p>
          </section>

          <section className={s.inCreator} aria-labelledby="creator">
            <div>
              <h2 id="creator" className="h3">
                In the creator
              </h2>
              <p className="muted">{fn.ui}</p>
            </div>
            <ButtonLink href={surfaceHref[fn.surface]} variant="secondary">
              Open {surface}
            </ButtonLink>
          </section>

          <nav className={s.pager} aria-label="Previous and next function">
            {prev && (
              <Link href={`/pipeline/${prev.slug}`}>
                <span>Previous</span>
                {prev.title}
              </Link>
            )}
            {next && (
              <Link href={`/pipeline/${next.slug}`} className={s.nextLink}>
                <span>Next</span>
                {next.title}
              </Link>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
