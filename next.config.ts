import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Bundle prompt.me into serverless functions so it's available at process.cwd()
  outputFileTracingIncludes: {
    '/api/analyze': ['./prompt.me'],
  },
}

export default nextConfig
