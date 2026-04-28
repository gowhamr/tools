import type { MetadataRoute } from 'next'
import { TOOLS } from '@/lib/tools'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://karuvilab.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries = TOOLS.map(tool => ({
    url: `${BASE_URL}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const infoPages = ['/about', '/contact', '/guides', '/privacy', '/terms'].map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    ...toolEntries,
    ...infoPages,
  ]
}
