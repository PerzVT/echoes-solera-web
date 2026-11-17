import type { Metadata } from "next";
import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import { Icon } from "@/components/labs/Icon";
import { Nav } from "@/components/labs/Nav";
import { Reveal } from "@/components/labs/fx/Reveal";
import { products } from "@/lib/labs/shop";
import { ProductCard } from "./ProductCard";
import t from "@/components/labs/Title.module.css";
import styles from "./shop.module.css";
import { og } from "@/lib/labs/og";

export const metadata: Metadata = { title: "Shop", ...og("Shop", "shop") };

export default function Shop() {
  return (
    <div className={t.page}>
      <Nav />
      <main id="main" className={t.main}>
        <section className={styles.hero} data-theme="light">
          <Image
            className={styles.heroArt}
            src="/labs/shop/hero-backpack.webp"
            alt=""
            width={1672}
            height={941}
            sizes="(max-width: 720px) 100vw, 1344px"
            priority
          />
          <div className={styles.heroCopy}>
            <h1 className="display">Shop</h1>
            <p className={styles.lede}>Objects from our worlds.</p>
          </div>
        </section>

        <section aria-labelledby="objects">
          <h2 id="objects" className="h2">
            Objects
          </h2>
          <Reveal as="ul" stagger className={styles.grid}>
            {products.map((p) => (
              <ProductCard key={p.slug} p={p} sizes="(max-width: 720px) 45vw, (max-width: 1100px) 30vw, 320px" />
            ))}
          </Reveal>
        </section>
      </main>
    </div>
  );
}
