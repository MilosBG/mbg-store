// next.config.mjs
/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    // disable powerful APIs by default
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  (() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    const admin = process.env.NEXT_PUBLIC_ADMIN_API;
    let connect = "'self' https:";
    try {
      const origins: string[] = [];
      if (api) origins.push(new URL(api).origin);
      if (admin) origins.push(new URL(admin).origin);
      if (origins.length) {
        connect = `\'self\' ${origins.join(' ')} https:`;
      }
    } catch {}
    return {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        // allow remote scripts (e.g., Clerk) over https
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
        "style-src 'self' 'unsafe-inline'",
        // allow images from https in addition to Cloudinary
        `img-src 'self' data: blob: https://res.cloudinary.com https:`,
        "font-src 'self' data:",
        // allow embedding frames from https providers (e.g., auth widgets)
        "frame-src 'self' https:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // allow secure websockets for auth providers
        `connect-src ${connect} wss:`,
      ].join('; '),
    };
  })(),
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
export default nextConfig;
