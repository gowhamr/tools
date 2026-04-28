import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import RegexTool from '@/components/tools/RegexTool'

const tool = getToolById('regex-tester')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function RegexTesterPage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <RegexTool />
    </>
  )
}
