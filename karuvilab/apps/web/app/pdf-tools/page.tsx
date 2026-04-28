import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import PdfTool from '@/components/tools/PdfTool'

const tool = getToolById('pdf-tools')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function PdfToolsPage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PdfTool />
    </>
  )
}
