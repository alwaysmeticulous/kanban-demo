// Builds destined for Meticulous set this; real production deploys leave it
// unset, so they never ship source maps. Same pattern as the Meticulous webapp
// (packages/webapp-frontend/next.config.js), which keeps the build itself a
// normal production build and only toggles the maps.
const enableSourceMaps = process.env.METICULOUS_SOURCE_MAPS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle so the Docker image we hand to
  // Meticulous does not need node_modules at runtime.
  output: "standalone",
  // Next omits browser source maps from production builds by default, and
  // without them Meticulous reports coverage against bundled chunks rather than
  // the original files.
  productionBrowserSourceMaps: enableSourceMaps,
  experimental: {
    // Browser maps do not cover the standalone server bundle; server maps are
    // what map Node V8 coverage back to the original TypeScript.
    ...(enableSourceMaps ? { serverSourceMaps: true } : {}),
  },
  // The home directory above this project also holds a pnpm lockfile; pin the
  // workspace root so Turbopack does not walk up to it.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
