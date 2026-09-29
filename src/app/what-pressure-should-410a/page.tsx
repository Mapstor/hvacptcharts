import type { Metadata } from "next";
import { OperatingPressurePage, buildOperatingMetadata } from "@/components/whatpressure/OperatingPressurePage";

const ID = "410a";

export const metadata: Metadata = buildOperatingMetadata(ID);

export default function Page() {
  return <OperatingPressurePage id={ID} />;
}
