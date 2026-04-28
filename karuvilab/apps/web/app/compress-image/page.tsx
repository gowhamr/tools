import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import CompressImageTool from '@/components/tools/CompressImageTool'

const tool = getToolById('compress-image')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function CompressImagePage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CompressImageTool />
    </>
  )
}
