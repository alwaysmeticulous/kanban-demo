import type { Metadata } from "next";

import { THEME_INIT_SCRIPT } from "@/lib/store";

import "./globals.css";

// A public, client-side value — it ships in the HTML — so it belongs inline
// here rather than in an env var.
const METICULOUS_RECORDING_TOKEN = "dKO1Q9pT7lytZtoUMZGocx64l1PtCfIzjZqY8sw9";

export const metadata: Metadata = {
  title: "Kanban demo",
  description: "A frontend-only kanban board used as a visual-testing demo app.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          The Meticulous recorder has to be the first script to load, so that it
          can instrument fetch and friends before anything else runs — hence a
          native <script> rather than next/script, with no defer and no async,
          and placed above the theme-init script below.

          Recording is on for local dev only, so sessions accrue while we build.
        */}
        {process.env.NODE_ENV === "development" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-recording-token={METICULOUS_RECORDING_TOKEN}
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
