import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import { notFound } from "next/navigation";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { gallerySize, productBySlug, products, sameWorld } from "@/lib/labs/shop";
import { ProductCard } from "../ProductCard";
import t from "@/components/labs/Title.module.css";
import shop from "../shop.module.css";
import styles from "./product.module.css";
import { og } from "@/lib/labs/og";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return { title: "Page not found" };
  return { title: p.name, ...og(p.name, "shop") };
}

export default async function ProductPage({ params }: Props) {
  const p = productBySlug((await params).slug);
  if (!p) notFound();

  const related = sameWorld(p);
  const more = related.length > 0 ? related : products.filter((o) => o.slug !== p.slug);

  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={t.main}>
        <article className={styles.product}>
          {/* Never drawn wider than the file itself: a small render stays sharp at its own size. */}
          <div className={styles.media} style={p.image.width < 760 ? { maxWidth: p.image.width } : undefined}>
            <Image
              src={p.image.src}
              alt={p.image.alt}
              width={p.image.width}
              height={p.image.height}
              sizes="(max-width: 900px) 100vw, 760px"
              priority
            />
          </div>
          <div className={styles.info}>
            <h1 className="h1">{p.name}</h1>
            <p className="muted">From {p.world}</p>
            <p className="body-lg">{p.description}</p>
          </div>
        </article>

        {p.gallery && (
          <section aria-labelledby="views">
            <h2 id="views" className="h2">
              More views
            </h2>
            <Reveal as="div" className={styles.sheet}>
              <Image
                src={p.gallery.src}
                alt={p.gallery.alt}
                width={gallerySize.width}
                height={gallerySize.height}
                sizes="(max-width: 1440px) 100vw, 1344px"
              />
            </Reveal>
          </section>
        )}

        <section aria-labelledby="more">
          <h2 id="more" className="h2">
            {related.length > 0 ? `More from ${p.world}` : "More from the shop"}
          </h2>
          <Reveal as="ul" stagger className={shop.grid}>
            {more.map((o) => (
              <ProductCard key={o.slug} p={o} sizes="(max-width: 720px) 45vw, (max-width: 1100px) 30vw, 320px" />
            ))}
          </Reveal>
        </section>
      </main>
    </div>
  );
}
