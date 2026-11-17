import Link from "next/link";
import { GestureIcon } from "@/components/labs/fx/AnimatedIcon";
import type { PipelineFunction } from "@/lib/labs/pipeline";
import s from "./pipeline.module.css";

/** One function a step uses: its name and purpose, linking to its page. */
export function FunctionRow({ fn }: { fn: PipelineFunction }) {
  return (
    <li>
      <Link href={`/pipeline/${fn.slug}`} className={s.fn}>
        <span>
          <span className={s.fnName}>{fn.title}</span>
          <span className={s.fnPurpose}>{fn.purpose}</span>
        </span>
        <span className={s.fnArrow}>
          <GestureIcon name="arrow" size={18} />
        </span>
      </Link>
    </li>
  );
}
