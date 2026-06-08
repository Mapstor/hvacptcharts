import type { Metadata } from "next";
import { WhatPressurePage, buildWhatPressureMetadata } from "@/components/whatpressure/WhatPressurePage";

const ID = "r454c";

export const metadata: Metadata = buildWhatPressureMetadata(ID);

export default function Page() {
  return <WhatPressurePage id={ID} />;
}
