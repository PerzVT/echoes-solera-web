/** Re-mounts on every route change, so each page fades up as it arrives (labs.css, .pageIn). */
export default function LabsTemplate({ children }: { children: React.ReactNode }) {
  return <div className="pageIn">{children}</div>;
}
