/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'uploadthing.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Suppress optional MongoDB peer dependency warnings (kerberos, snappy, etc.)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      // These are optional MongoDB deps not needed for Atlas connections
      config.externals.push(
        'kerberos',
        'snappy',
        '@mongodb-js/zstd',
        '@aws-sdk/credential-providers',
        'gcp-metadata',
        'socks',
        'aws4',
        'mongodb-client-encryption'
      )
    }
    return config
  },
}

export default nextConfig
