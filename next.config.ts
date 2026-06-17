import type { NextConfig } from 'next';

const SPINE_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://localhost:9000";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  reactStrictMode: true,
  // Same-origin proxy for the WRDO conversation spine (WRDO-180).
  //
  // The spine chat widget (src/components/spine) calls RELATIVE /spine/* paths
  // with credentials:'same-origin' so the httpOnly `wrdo_spine` cookie stays
  // first-party on shop.wrdo.co.za and there's no CORS. These rewrites proxy
  // ONLY the three spine endpoints to the Medusa backend from within the same
  // Cloudflare Worker, keeping the same origin to the browser.
  //
  // The spine API lives at /spine/* (NOT /store/*): Medusa hard-requires a
  // publishable key on every /store/* route with no per-route opt-out, so the
  // spine — which authenticates via its own wrdo_spine cookie — uses a custom
  // prefix that escapes that middleware. The /c handoff page is a real Next.js
  // page, untouched by these matchers.
  async rewrites() {
    return [
      { source: "/spine/messages", destination: `${SPINE_BACKEND_URL}/spine/messages` },
      { source: "/spine/messages/:path*", destination: `${SPINE_BACKEND_URL}/spine/messages/:path*` },
      { source: "/spine/thread", destination: `${SPINE_BACKEND_URL}/spine/thread` },
      { source: "/spine/session/:path*", destination: `${SPINE_BACKEND_URL}/spine/session/:path*` },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'mercur-connect.s3.eu-central-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'api.mercurjs.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'api-sandbox.mercurjs.com',
        pathname: '/static/**'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 's3.eu-central-1.amazonaws.com'
      },
      {
        protocol: "https",
        hostname: "mercur-testing.up.railway.app",
      },
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;

// @opennextjs/cloudflare — enables Cloudflare bindings during `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
