import { Picture as Image } from "@/components/labs/fx/Picture";
import Link from "next/link";
import type { Product } from "@/lib/labs/shop";
import styles from "./shop.module.css";

export function ProductCard({ p, sizes }: { p: Product; sizes: string }) {
  return (
    <li>
      <Link href={`/shop/${p.slug}`} className={styles.card}>
        <span className={styles.thumb}>
          <Image
            src={p.image.src}
            alt=""
            width={p.image.width}
            height={p.image.height}
            sizes={sizes}
            style={p.focus ? { objectPosition: p.focus } : undefined}
          />
        </span>
        <span className={styles.name}>{p.name}</span>
        <span className="small muted">{p.world}</span>
      </Link>
    </li>
  );
}
