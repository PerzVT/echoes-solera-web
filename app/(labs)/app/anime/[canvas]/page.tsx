import { redirect } from "next/navigation";

/** The old anime canvases are gone: their addresses open the anime Library. */
export default function OldCanvasPage() {
  redirect("/app/anime/library");
}
