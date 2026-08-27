import styles from "./SiteCredit.module.css";

/**
 * SiteCredit — the corporate name, tucked into the bottom-left corner.
 *
 * `visible` is driven by the dive phase so the credit stays hidden through the
 * opening black void and fades up with the scene.
 */
export function SiteCredit({ visible }: { visible: boolean }) {
  return (
    <p className={`${styles.credit} ${visible ? styles.creditIn : ""}`}>
      Retinad Virtual Reality Inc. / Retinad Réalité Virtuelle Inc.
    </p>
  );
}
