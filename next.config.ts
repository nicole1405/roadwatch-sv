import type { NextConfig } from "next";

// ─── Environment variable validation ──────────────────────────────────────────
// Runs at build time and dev-server start.
// Only NEXT_PUBLIC_* variables are inlined into the client bundle by Next.js.
// Server-only variables (without the prefix) are available only in
// API routes and Server Components — never in browser code.

const REQUIRED_CLIENT_ENV_VARS = [
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
] as const;

for (const key of REQUIRED_CLIENT_ENV_VARS) {
  if (!process.env[key]) {
    console.warn(
      `\n[next.config] WARNING: Environment variable "${key}" is not set.\n` +
      `  → The Google Maps component will show the "For development purposes only" watermark.\n` +
      `  → Add the variable in Vercel (Settings > Vars) or in your local .env.local file.\n` +
      `  → See .env.example for setup instructions.\n`
    );
  }
}

// ─── Next.js config ───────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  // Explicitly document the client-side public env vars this app depends on.
  // These are already inlined by the NEXT_PUBLIC_ prefix convention; listing
  // them here makes the dependency explicit and visible in one place.
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  },
};

export default nextConfig;
