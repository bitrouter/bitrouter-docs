import { permanentRedirect } from "next/navigation";

/** The catalog now lives alongside the pricing explanation. */
export default function Page() {
  permanentRedirect("/pricing#models");
}
