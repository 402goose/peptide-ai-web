'use client'

import { ExternalLink, Pill } from 'lucide-react'
import { api } from '@/lib/api'
import type { HolisticProduct } from '@/types/affiliate'
import { PRODUCT_TYPE_LABELS } from '@/types/affiliate'

interface ProductCardProps {
  product: HolisticProduct
  source: 'journey' | 'chat' | 'stacks' | 'search' | 'symptom_page'
  sourceId?: string
  symptomId?: string
  compact?: boolean
}

export function ProductCard({
  product,
  source,
  sourceId,
  symptomId,
  compact = false,
}: ProductCardProps) {
  const handleClick = async () => {
    try {
      const result = await api.trackAffiliateClick({
        product_id: product.product_id,
        symptom_id: symptomId,
        source,
        source_id: sourceId,
      })

      // If there's an affiliate URL, open it
      if (result.affiliate_url) {
        window.open(result.affiliate_url, '_blank')
      }
    } catch (err) {
      console.error('Failed to track click:', err)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
      >
        {product.is_peptide && <Pill className="w-3 h-3" />}
        {product.name}
        <ExternalLink className="w-3 h-3" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors text-left"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white">
            {product.name}
          </span>
          {product.is_peptide && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              Peptide
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">
            {PRODUCT_TYPE_LABELS[product.product_type]}
          </span>
          {product.description && (
            <span className="text-xs text-slate-400">
              - {product.description.slice(0, 50)}...
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </button>
  )
}

export default ProductCard
