'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, MessageSquare, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { getCategoriesFromCheckIn, getCategoryLabel } from '@/lib/symptomKeywords'
import { CATEGORY_COLORS, PRODUCT_TYPE_LABELS } from '@/types/affiliate'
import type { HolisticProduct, SymptomCategory } from '@/types/affiliate'
import { useToast } from '@/components/ui/Toast'

interface CheckInData {
  energyLevel?: number
  sleepQuality?: number
  mood?: number
  recoveryFeeling?: number
}

interface CheckInInsightsProps {
  checkIn: CheckInData
  onDismiss: () => void
  onAskAI?: (query: string) => void
  onAddToStack?: (productName: string) => void
}

export function CheckInInsights({
  checkIn,
  onDismiss,
  onAskAI,
  onAddToStack,
}: CheckInInsightsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<HolisticProduct[]>([])
  const [categories, setCategories] = useState<SymptomCategory[]>([])

  // Detect low scores and fetch products
  useEffect(() => {
    async function fetchProducts() {
      // Convert to the format expected by getCategoriesFromCheckIn
      const checkInForMapping = {
        energy_level: checkIn.energyLevel,
        sleep_quality: checkIn.sleepQuality,
        mood: checkIn.mood,
        recovery_feeling: checkIn.recoveryFeeling,
      }

      // Get categories from low scores (threshold of 5)
      const detectedCategories = getCategoriesFromCheckIn(checkInForMapping, 5)

      if (detectedCategories.length === 0) {
        setLoading(false)
        return
      }

      setCategories(detectedCategories)
      setLoading(true)

      try {
        // Fetch products for the first detected category
        const { symptoms } = await api.getSymptoms(detectedCategories[0])

        if (symptoms.length > 0) {
          const symptomDetail = await api.getSymptomBySlug(symptoms[0].slug)
          setProducts(symptomDetail.products.slice(0, 2))
        }
      } catch (error) {
        console.error('Failed to fetch insight products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [checkIn])

  const handleAskAI = (product: HolisticProduct) => {
    const categoryName = categories.length > 0 ? getCategoryLabel(categories[0]) : 'your symptoms'
    const query = `I'm experiencing low ${categoryName}. Tell me about ${product.name} - what are the benefits and how might it help?`

    if (onAskAI) {
      onAskAI(query)
    } else {
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    }
  }

  const handleAddToStack = (product: HolisticProduct) => {
    if (onAddToStack) {
      onAddToStack(product.name)
    }
    showToast(`Added ${product.name} to your stack`, 'success')
  }

  const handleBrowseGuide = () => {
    router.push('/tools/symptoms')
    onDismiss()
  }

  // Don't show if no low scores detected
  if (!loading && categories.length === 0) {
    return null
  }

  // Build the insight message based on low scores
  const getLowScoreMessage = () => {
    const lowAreas: string[] = []
    if (checkIn.energyLevel && checkIn.energyLevel < 5) lowAreas.push(`energy (${checkIn.energyLevel}/10)`)
    if (checkIn.sleepQuality && checkIn.sleepQuality < 5) lowAreas.push(`sleep (${checkIn.sleepQuality}/10)`)
    if (checkIn.mood && checkIn.mood < 5) lowAreas.push(`mood (${checkIn.mood}/10)`)
    if (checkIn.recoveryFeeling && checkIn.recoveryFeeling < 5) lowAreas.push(`recovery (${checkIn.recoveryFeeling}/10)`)

    if (lowAreas.length === 0) return null
    if (lowAreas.length === 1) return `Your ${lowAreas[0]} could use some support.`
    return `Your ${lowAreas.slice(0, -1).join(', ')} and ${lowAreas[lowAreas.length - 1]} could use some support.`
  }

  const message = getLowScoreMessage()
  if (!message && !loading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-4"
      >
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 overflow-hidden">
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/50 transition-colors"
          >
            <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </button>

          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Based on your check-in
                </h3>
              </div>
            </div>

            {message && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {message}
              </p>
            )}

            {/* Category chips */}
            {categories.length > 0 && (
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
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50"
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
                        className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        onClick={() => handleAskAI(product)}
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
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              onClick={handleBrowseGuide}
            >
              Browse Symptom Guide
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
