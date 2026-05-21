import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://hvacptcharts.com"),
  title: {
    default: "HVAC PT Charts — Verified Pressure-Temperature Data",
    template: "%s | HVAC PT Charts",
  },
  description:
    "Verified saturation pressure-temperature charts for 61 refrigerants, plus calculators for superheat, subcooling, charge, and retrofit. Data sourced from CoolProp and manufacturer datasheets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
