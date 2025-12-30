'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, X, Plus, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { getCategoryLabel } from '@/lib/symptomKeywords'
import { CATEGORY_COLORS, PRODUCT_TYPE_LABELS } from '@/types/affiliate'
import type { SymptomCategory, HolisticProduct, Symptom } from '@/types/affiliate'
import { useToast } from '@/components/ui/Toast'

interface SymptomProductCardProps {
  categories: SymptomCategory[]
  onDismiss: () => void
  onLearnMore: (message: string) => void
  onAddToStack: (productId: string) => void
}

export function SymptomProductCard({
  categories,
  onDismiss,
  onLearnMore,
  onAddToStack,
}: SymptomProductCardProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<HolisticProduct[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [activeCategory] = useState<SymptomCategory>(categories[0])

  // Fetch products for the detected category
  useEffect(() => {
    async function fetchProducts() {
      if (!activeCategory) return

      setLoading(true)
      try {
        // Get symptoms for this category
        const { symptoms: categorySymptoms } = await api.getSymptoms(activeCategory)
        setSymptoms(categorySymptoms.slice(0, 3))

        // Get products from the first symptom
        if (categorySymptoms.length > 0) {
          const symptomDetail = await api.getSymptomBySlug(categorySymptoms[0].slug)
          setProducts(symptomDetail.products.slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to fetch symptom products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [activeCategory])

  const handleAskAbout = (product: HolisticProduct) => {
    const symptomName = symptoms[0]?.name || getCategoryLabel(activeCategory)
    onLearnMore(`Tell me about ${product.name} for ${symptomName}. What are the benefits, dosing, and things to consider?`)
  }

  const handleAddToStack = (product: HolisticProduct) => {
    onAddToStack(product.name)
    showToast(`Added ${product.name} to your stack`, 'success')
  }

  const handleBrowseGuide = () => {
    router.push(`/tools/symptoms`)
    onDismiss()
  }

  if (categories.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-2xl mt-4 mb-2"
    >
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 overflow-hidden">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
        >
          <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </button>

        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Products for {getCategoryLabel(activeCategory)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on what you mentioned
              </p>
            </div>
          </div>

          {/* Category chips */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[cat]}20`,
                    color: CATEGORY_COLORS[cat],
                  }}
                >
                  {getCategoryLabel(cat)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div className="px-4 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-100 dark:border-amber-900/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 dark:text-white">
                          {product.name}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          {PRODUCT_TYPE_LABELS[product.product_type]}
                        </span>
                        {product.is_peptide && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            Peptide
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                      onClick={() => handleAskAbout(product)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Ask AI
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-slate-600 hover:text-slate-700 dark:text-slate-400"
                      onClick={() => handleAddToStack(product)}
                    >
                      <Plus className="h-3 w-3" />
                      Add to Stack
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No products found for this category
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            onClick={handleBrowseGuide}
          >
            Browse Full Symptom Guide
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
