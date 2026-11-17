import { ButtonLink } from "@/components/labs/Button";
import { Nav } from "@/components/labs/Nav";
import { AnimatedMark, LIGHT_MATERIALS } from "@/components/labs/fx/AnimatedMark";
import { AsciiField } from "@/components/labs/fx/AsciiField";

// The mark, set in glyphs and slowly weathering. It thins out towards the middle, where the words are.
const clear = "radial-gradient(closest-side, rgb(0 0 0 / 0.3) 0 30%, #000 70%, #000 100%)";

export default function NotFound() {
  return (
    <div data-backdrop="high" style={{ padding: "16px 24px", minHeight: "100dvh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <Nav />
      <main id="main" style={{ position: "relative", display: "grid", placeContent: "center", justifyItems: "center", gap: 16, textAlign: "center", padding: "48px 0" }}>
        <AsciiField src="/labs/brand/mark-paper.svg" cell={18} intensity={0.32} accent={false} style={{ WebkitMaskImage: clear, maskImage: clear }} />
        <AnimatedMark variant="cycle" material={LIGHT_MATERIALS} size={128} style={{ position: "relative", marginBottom: 12 }} />
        <h1 className="h1" style={{ position: "relative" }}>
          This page does not exist
        </h1>
        <p className="muted" style={{ position: "relative" }}>
          The address may be wrong, or the page has moved.
        </p>
        <ButtonLink href="/" style={{ position: "relative", marginTop: 12 }}>
          Go to the projects
        </ButtonLink>
      </main>
    </div>
  );
}
