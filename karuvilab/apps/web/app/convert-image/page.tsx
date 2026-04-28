import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import ConvertImageTool from '@/components/tools/ConvertImageTool'

const tool = getToolById('convert-image')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function ConvertImagePage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ConvertImageTool />
    </>
  )
}
