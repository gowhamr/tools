import type { Metadata } from 'next'
import { buildToolMetadata, buildWebAppSchema } from '@/lib/metadata'
import { getToolById } from '@/lib/tools'
import SipCalculatorTool from '@/components/tools/SipCalculatorTool'

const tool = getToolById('sip-calculator')!

export const metadata: Metadata = buildToolMetadata(tool)

export default function SipCalculatorPage() {
  const schema = buildWebAppSchema(tool)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SipCalculatorTool />
    </>
  )
}
