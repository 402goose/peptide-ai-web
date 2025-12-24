'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical, Users, Pill, ShoppingCart,
  ExternalLink, CheckCircle2, AlertTriangle, Clock, TrendingUp,
  ChevronDown, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Source } from '@/types'
import { trackSourceClicked } from '@/lib/analytics'

interface ResponseCardProps {
  sources: Source[]
  peptidesMentioned?: string[]
  showVendors?: boolean
}

// Handle source click with tracking
function handleSourceClick(source: Source) {
  trackSourceClicked({
    sourceType: source.type || 'unknown',
    sourceUrl: source.url,
    sourceTitle: source.title,
  })
}

type TabId = 'research' | 'experiences' | 'protocol' | 'vendors'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  color: string
}

const TABS: Tab[] = [
  { id: 'research', label: 'Research', icon: FlaskConical, color: 'text-blue-500' },
  { id: 'experiences', label: 'Experiences', icon: Users, color: 'text-purple-500' },
  { id: 'protocol', label: 'Protocol', icon: Pill, color: 'text-green-500' },
  { id: 'vendors', label: 'Where to Buy', icon: ShoppingCart, color: 'text-orange-500' },
]

// Placeholder vendor data - would come from API
const VENDORS = [
  {
    name: 'Peptide Sciences',
    rating: 4.8,
    reviews: 1200,
    coa: true,
    shipping: 'US Only',
    url: '#',
  },
  {
    name: 'Swiss Chems',
    rating: 4.6,
    reviews: 850,
    coa: true,
    shipping: 'Worldwide',
    url: '#',
  },
]

export function ResponseCard({ sources, peptidesMentioned = [], showVendors = true }: ResponseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('research')

  // Separate sources by type
  const researchSources = sources.filter(s => s.type === 'pubmed' || s.type === 'arxiv' || s.type === 'biorxiv')
  const experienceSources = sources.filter(s => s.type === 'reddit' || s.type === 'user_journey')

  // Build summary items
  const summaryItems = []
  if (researchSources.length > 0) {
    summaryItems.push({ icon: FileText, count: researchSources.length, label: 'papers', color: 'text-blue-500' })
  }
  if (experienceSources.length > 0) {
    summaryItems.push({ icon: Users, count: experienceSources.length, label: 'experiences', color: 'text-purple-500' })
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      {/* Collapsed Summary Bar - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
            <FlaskConical className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            {summaryItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                <span className="text-slate-600 dark:text-slate-300">
                  {item.count} {item.label}
                </span>
                {i < summaryItems.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
                )}
              </span>
            ))}
            {summaryItems.length === 0 && (
              <span className="text-slate-500">View research details</span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-400 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Tab Header */}
            <div className="flex border-t border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                // Hide vendors tab if not enabled
                if (tab.id === 'vendors' && !showVendors) return null

                // Get count for badge
                let count = 0
                if (tab.id === 'research') count = researchSources.length
                if (tab.id === 'experiences') count = experienceSources.length

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative",
                      activeTab === tab.id
                        ? "text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4", activeTab === tab.id && tab.color)} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "px-1.5 py-0.5 text-xs rounded-full",
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      )}>
                        {count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Research Tab */}
              {activeTab === 'research' && (
                <div className="space-y-2">
                  {researchSources.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      No research sources for this query
                    </p>
                  ) : (
                    researchSources.map((source, index) => (
                      <div
                        key={index}
                        className="group rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 p-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleSourceClick(source)}
                                className="block"
                              >
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {source.title}
                                </h4>
                              </a>
                            ) : (
                              <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                {source.title}
                              </h4>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {source.citation}
                            </p>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1.5"
                                onClick={() => handleSourceClick(source)}
                              >
                                {source.type === 'pubmed' ? 'PubMed' :
                                 source.type === 'arxiv' ? 'arXiv' :
                                 source.type === 'biorxiv' ? 'bioRxiv' :
                                 'Source'}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Experiences Tab */}
              {activeTab === 'experiences' && (
                <div className="space-y-3">
                  {experienceSources.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No user experiences found
                      </p>
                    </div>
                  ) : (
                    experienceSources.map((source, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/20 p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            {source.type === 'reddit' ? 'Reddit' : 'User Journey'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{source.citation}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {source.title}
                        </p>
                      </div>
                    ))
                  )}

                  {/* Coming Soon Notice */}
                  <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 border border-purple-100/50 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        People Like You
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      We're building personalized experience matching. Coming soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Protocol Tab */}
              {activeTab === 'protocol' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 p-3">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-500" />
                      Protocol Information
                    </h4>

                    {peptidesMentioned.length > 0 ? (
                      <div className="space-y-2">
                        {peptidesMentioned.slice(0, 3).map((peptide, i) => (
                          <div key={i} className="bg-white dark:bg-slate-800 rounded p-2">
                            <h5 className="font-medium text-sm text-slate-900 dark:text-white">{peptide}</h5>
                            <p className="text-xs text-slate-500 mt-1">
                              Protocol details coming soon
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Ask about a specific peptide to see protocol information.
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                    <p>For research purposes only. Consult a healthcare provider.</p>
                  </div>
                </div>
              )}

              {/* Vendors Tab */}
              {activeTab === 'vendors' && showVendors && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Vetted vendors with third-party testing:
                  </p>

                  <div className="space-y-2">
                    {VENDORS.map((vendor, index) => (
                      <a
                        key={index}
                        href={vendor.url}
                        className="block rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                            {vendor.name}
                          </h4>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium text-orange-600">{vendor.rating}</span>
                            <span className="text-xs text-slate-400">({vendor.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {vendor.coa && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              COA
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {vendor.shipping}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>Note:</strong> Verify peptide legality in your jurisdiction.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
