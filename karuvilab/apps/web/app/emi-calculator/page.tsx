import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import EmiCalculatorTool from '@/components/tools/EmiCalculatorTool'

const tool = getToolById('emi-calculator')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function EmiCalculatorPage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <EmiCalculatorTool />
    </>
  )
}
