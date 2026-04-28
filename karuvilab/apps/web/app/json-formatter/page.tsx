import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import JsonFormatterTool from '@/components/tools/JsonFormatterTool'

const tool = getToolById('json-formatter')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function JsonFormatterPage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <JsonFormatterTool />
    </>
  )
}
