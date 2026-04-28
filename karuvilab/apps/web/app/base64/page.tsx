import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import Base64Tool from '@/components/tools/Base64Tool'

const tool = getToolById('base64')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function Base64Page() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Base64Tool />
    </>
  )
}
