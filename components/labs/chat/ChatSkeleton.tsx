import { Skeleton, SkeletonGroup } from "@/components/labs/fx";
import a from "./app.module.css";
import r from "./rail.module.css";
import c from "./composer.module.css";
import doc from "./views/doc.module.css";
import nc from "./views/new.module.css";

/** The chat screen while it is on its way: the bar, the rail with its prompt box, and the work. `chat` draws a thread and a document; without it, the new chat. */
export function ChatSkeleton({ chat = false }: { chat?: boolean }) {
  return (
    <SkeletonGroup label="Loading" className={a.app}>
      <div className={a.top}>
        <Skeleton width={36} height={36} radius={10} />
        <Skeleton width={chat ? 280 : 120} height={20} radius={6} index={1} />
        <span className={a.topEnd}>
          <Skeleton width={110} height={32} radius="var(--r-pill)" index={2} />
          <Skeleton width={150} height={32} radius="var(--r-pill)" index={3} />
        </span>
      </div>
      <div className={a.rail}>
        <div className={r.rail}>
          <div className={r.msgs}>
            {chat && (
              <>
                <Skeleton width="50%" height={40} radius={10} style={{ alignSelf: "flex-end" }} />
                <Skeleton width="80%" height={20} radius={6} index={1} />
                <Skeleton width="70%" height={40} radius={10} index={2} />
              </>
            )}
          </div>
          <div className={r.foot}>
            <div className={c.box}>
              <Skeleton height={48} radius={8} />
              <Skeleton width={200} height={24} radius={6} index={1} />
              <Skeleton height={40} radius={10} index={2} />
            </div>
          </div>
        </div>
      </div>
      <div className={a.work}>
        {chat ? (
          <div className={a.view} style={{ gridRow: "1 / -1" }}>
            <div className={doc.doc}>
              <Skeleton width={220} height={36} radius={8} />
              <div style={{ display: "grid", gap: 12, marginTop: 32 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} width={`${90 - (i % 3) * 15}%`} height={18} radius={6} index={i} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={a.view} style={{ gridRow: "1 / -1" }}>
            <div className={nc.new}>
              <Skeleton width={360} height={48} radius={8} style={{ maxWidth: "100%" }} />
              <Skeleton height={240} radius={20} index={1} />
              <Skeleton width={420} height={40} radius={12} index={2} style={{ maxWidth: "100%" }} />
            </div>
          </div>
        )}
      </div>
    </SkeletonGroup>
  );
}
