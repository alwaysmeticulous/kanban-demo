/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle so the Docker image we hand to
  // Meticulous does not need node_modules at runtime.
  output: "standalone",
  // The home directory above this project also holds a pnpm lockfile; pin the
  // workspace root so Turbopack does not walk up to it.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
