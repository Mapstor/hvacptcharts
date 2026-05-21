import type { Metadata } from "next";
import { WhatPressurePage, buildWhatPressureMetadata } from "@/components/whatpressure/WhatPressurePage";

const ID = "r22";

export const metadata: Metadata = buildWhatPressureMetadata(ID);

export default function Page() {
  return <WhatPressurePage id={ID} />;
}
