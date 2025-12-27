'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronRight, Pill, FlaskConical, ExternalLink, X } from 'lucide-react'
import { api } from '@/lib/api'
import type {
  Symptom,
  SymptomWithProducts,
  CategoryCount,
  HolisticProduct,
  SymptomCategory,
} from '@/types/affiliate'
import { CATEGORY_LABELS, CATEGORY_COLORS, PRODUCT_TYPE_LABELS } from '@/types/affiliate'

interface SymptomBrowserProps {
  source: 'journey' | 'chat' | 'stacks' | 'search' | 'symptom_page'
  sourceId?: string
  onProductClick?: (product: HolisticProduct, symptomId?: string) => void
  compact?: boolean
}

export function SymptomBrowser({
  source,
  sourceId,
  onProductClick,
  compact = false,
}: SymptomBrowserProps) {
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | null>(null)
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomWithProducts | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getSymptomCategories()
        setCategories(cats)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load categories:', err)
        setError('Failed to load symptom categories')
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Load symptoms when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSymptoms([])
      return
    }

    async function loadSymptoms() {
      try {
        const { symptoms: syms } = await api.getSymptoms(selectedCategory ?? undefined)
        setSymptoms(syms)
      } catch (err) {
        console.error('Failed to load symptoms:', err)
      }
    }
    loadSymptoms()
  }, [selectedCategory])

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const results = await api.searchSymptomsAndProducts(searchQuery, source)
      setSymptoms(results.symptoms)
      setSelectedCategory(null)
      setLoading(false)
    } catch (err) {
      console.error('Search failed:', err)
      setLoading(false)
    }
  }, [searchQuery, source])

  // Load symptom details
  const handleSymptomClick = async (symptom: Symptom) => {
    try {
      const details = await api.getSymptomBySlug(symptom.slug)
      setSelectedSymptom(details)
    } catch (err) {
      console.error('Failed to load symptom details:', err)
    }
  }

  // Track click and handle product
  const handleProductClick = async (product: HolisticProduct) => {
    try {
      await api.trackAffiliateClick({
        product_id: product.product_id,
        symptom_id: selectedSymptom?.symptom_id,
        source,
        source_id: sourceId,
      })

      if (onProductClick) {
        onProductClick(product, selectedSymptom?.symptom_id)
      }
    } catch (err) {
      console.error('Failed to track click:', err)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    )
  }

  // Symptom detail view
  if (selectedSymptom) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-lg ${compact ? '' : 'p-4'}`}>
        <button
          onClick={() => setSelectedSymptom(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
        >
          <X className="w-4 h-4" />
          Back to symptoms
        </button>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {selectedSymptom.name}
        </h3>

        <span
          className="inline-block px-2 py-0.5 text-xs rounded-full mb-4"
          style={{
            backgroundColor: `${CATEGORY_COLORS[selectedSymptom.category]}20`,
            color: CATEGORY_COLORS[selectedSymptom.category],
          }}
        >
          {CATEGORY_LABELS[selectedSymptom.category]}
        </span>

        {selectedSymptom.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {selectedSymptom.description}
          </p>
        )}

        {/* Recommended Products */}
        {selectedSymptom.products.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Recommended Products ({selectedSymptom.products.length})
            </h4>
            <div className="space-y-2">
              {selectedSymptom.products.map((product) => (
                <button
                  key={product.product_id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {product.name}
                    </span>
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {PRODUCT_TYPE_LABELS[product.product_type]}
                    </span>
                    {product.is_peptide && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        Peptide
                      </span>
                    )}
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1">{product.description}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Lab Tests */}
        {selectedSymptom.labs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Recommended Lab Tests ({selectedSymptom.labs.length})
            </h4>
            <div className="space-y-2">
              {selectedSymptom.labs.map((lab) => (
                <div
                  key={lab.test_id}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {lab.name}
                  </span>
                  {lab.description && (
                    <p className="text-xs text-slate-500 mt-1">{lab.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg ${compact ? '' : 'p-4'}`}>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search symptoms or products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Categories or Symptoms List */}
      {selectedCategory || symptoms.length > 0 ? (
        <div>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSymptoms([])
              }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
            >
              <X className="w-4 h-4" />
              Back to categories
            </button>
          )}

          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'Search Results'}
            <span className="ml-2 text-slate-400">({symptoms.length})</span>
          </h4>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {symptoms.map((symptom) => (
              <button
                key={symptom.symptom_id}
                onClick={() => handleSymptomClick(symptom)}
                className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <span className="text-sm text-slate-900 dark:text-white">
                  {symptom.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Browse by Category
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category] }}
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {CATEGORY_LABELS[cat.category]}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SymptomBrowser
