import type { Gen } from "../agent";
import { quote } from "../data";
import shared from "./shared.module.css";
import own from "./doc.module.css";

const v = { ...shared, ...own };

/** One block per generation: number, summary and prompt. Read only: feedback is a message. The quote sits on top once he asks for it. */
export function PromptsView({ gens, quoted }: { gens: Gen[]; quoted: boolean }) {
  return (
    <div className={v.doc}>
      <header className={v.docHead}>
        <h2 className={v.docTitle}>Prompts</h2>
        <p className={v.meta}>{gens.length} prompts</p>
      </header>
      {quoted && (
        <section className={v.quote} aria-label="Quote">
          <p className={v.quoteRow}>
            <span>{quote.provider}</span>
            <span className={v.meta}>{quote.covers}</span>
          </p>
          <p className={v.quoteRow}>
            <span>Price</span>
            <span className={v.price}>{quote.price}</span>
          </p>
        </section>
      )}
      <ol className={v.prompts}>
        {gens.map((g) => (
          <li key={g.n} className={v.prompt}>
            <span className={v.promptNum} aria-hidden="true">
              {g.n}
            </span>
            <div>
              <h3 className={v.promptHead}>
                <span className="sr-only">Generation {g.n}, </span>
                {g.summary}
              </h3>
              <p className={v.promptText}>{g.prompt}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
