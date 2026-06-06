import type { NextConfig } from "next";

// Supabase wildcard covers all project subdomains (API, Auth, Storage, Realtime)
const SUPABASE = "*.supabase.co";

const csp = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for hydration; 'unsafe-eval' for dev HMR
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com https://${SUPABASE}`,
  `connect-src 'self' https://${SUPABASE} wss://${SUPABASE}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — listing photos uploaded via ImageUploader
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // X-Frame-Options is redundant with frame-ancestors in CSP but kept
          // for older browsers that do not support CSP frame-ancestors.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
