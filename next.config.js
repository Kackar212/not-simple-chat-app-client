const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const remoteDevPatterns = [
  {
    protocol: "https",
    hostname: "localhost",
    port: "4000",
    pathname: "**",
  },
  {
    protocol: "https",
    hostname: "jdecked.github.io",
    pathname: "/twemoji/v/latest/svg/*",
  },
  {
    protocol: "https",
    hostname: "raw.githubusercontent.com",
    pathname: "/jdecked/twemoji/refs/heads/main/assets/svg/*",
  },
  {
    protocol: "https",
    hostname: "media.tenor.com",
    pathname: "**",
  },
];

const remoteProdPatterns = [
  {
    protocol: "https",
    hostname: "api.kackar.site",
    pathname: "**",
  },
  {
    protocol: "https",
    hostname: "jdecked.github.io",
    pathname: "/twemoji/v/latest/svg/*",
  },
  {
    protocol: "https",
    hostname: "raw.githubusercontent.com",
    pathname: "/jdecked/twemoji/refs/heads/main/assets/svg/*",
  },
  {
    protocol: "https",
    hostname: "media.tenor.com",
    pathname: "**",
  },
];

module.exports = (/** @type {string} */ phase) => {
  const webpack = (
    /** @type {{ module: { rules: { 
    test: RegExp; type: string;
    resourceQuery: RegExp | { not: RegExp[] };
    use?: Array<{ loader: string; options: Record<string, unknown> }>;
    issuer?: unknown;
    type?: string;
    exclude?: RegExp;
    resourceQuery: RegExp; }[]; }; }} */ config
  ) => {
    const fileLoaderRule = config.module.rules.find(
      (/** @type {{ test: { test: (arg0: string) => any; }; }} */ rule) =>
        rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      {
        test: /\.svg$/i,
        type: "asset/resource",
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule?.issuer,
        resourceQuery: { not: [/url/] },
        use: [
          { loader: "@svgr/webpack", options: { icon: true, svgo: false } },
        ],
      }
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      webpack,
      images: {
        remotePatterns: remoteDevPatterns,
        dangerouslyAllowSVG: true,
      },
      async headers() {
        return [
          {
            source: "/:all*(svg|jpg|png|webp)*",
            locale: false,
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=9999999",
              },
            ],
          },
        ];
      },
    };
  }

  return {
    webpack,
    images: {
      remotePatterns: remoteProdPatterns,
      dangerouslyAllowSVG: true,
    },
    env: {
      NEXT_PUBLIC_APP_URL: "https://www.kackar.site",
      NEXT_PUBLIC_API_URL: "https://api.kackar.site",
      NEXT_PUBLIC_WEBSOCKET_URL: "https://api.kackar.site",
    },
  };
};
