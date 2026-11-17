import { notFound } from "next/navigation";

/** Any address the site does not have lands on the labs not-found page. */
export default function Missing() {
  notFound();
}
