'use client'

import { useState } from 'react'
import {
  FlaskConical, Users, Pill, ShoppingCart,
  ExternalLink, CheckCircle2, AlertTriangle, Clock, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Source } from '@/types'

interface ResponseCardProps {
  sources: Source[]
  peptidesMentioned?: string[]
  showVendors?: boolean
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
  { id: 'experiences', label: 'User Experiences', icon: Users, color: 'text-purple-500' },
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
  const [activeTab, setActiveTab] = useState<TabId>('research')

  // Separate sources by type
  const researchSources = sources.filter(s => s.type === 'pubmed' || s.type === 'arxiv' || s.type === 'biorxiv')
  const experienceSources = sources.filter(s => s.type === 'reddit' || s.type === 'user_journey')

  return (
    <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      {/* Tab Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-3">
            {researchSources.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No research sources for this query
              </p>
            ) : (
              researchSources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {source.title}
                            <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                        </a>
                      ) : (
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                          {source.title}
                        </h4>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {source.citation}
                      </p>
                      {/* Always show link if available */}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                        >
                          {source.type === 'pubmed' ? 'View on PubMed' :
                           source.type === 'arxiv' ? 'View on arXiv' :
                           source.type === 'biorxiv' ? 'View on bioRxiv' :
                           'View Source'}
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
          <div className="space-y-4">
            {experienceSources.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No user experiences found for this query
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  We're adding Reddit data soon!
                </p>
              </div>
            ) : (
              experienceSources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/20 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      r/{source.type === 'reddit' ? 'peptides' : 'User Journey'}
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
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  People Like You
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                We're building a feature to show experiences from users with similar goals.
                Track your journey to contribute!
              </p>
            </div>
          </div>
        )}

        {/* Protocol Tab */}
        {activeTab === 'protocol' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-green-500" />
                Typical Protocol Information
              </h4>

              {peptidesMentioned.length > 0 ? (
                <div className="space-y-3">
                  {peptidesMentioned.slice(0, 3).map((peptide, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded p-3">
                      <h5 className="font-medium text-sm text-slate-900 dark:text-white">{peptide}</h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Protocol details based on research and user reports will appear here.
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
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <p>
                Protocol information is for research purposes only.
                Consult a healthcare provider before use.
              </p>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && showVendors && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Vetted vendors with third-party testing and COA verification:
            </p>

            <div className="space-y-3">
              {VENDORS.map((vendor, index) => (
                <a
                  key={index}
                  href={vendor.url}
                  className="block rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {vendor.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-orange-600">{vendor.rating}</span>
                      <span className="text-xs text-slate-400">({vendor.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {vendor.coa && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        COA Available
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

            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <strong>Note:</strong> Peptide legality varies by jurisdiction.
              These vendors sell for research purposes. Verify legal status in your area.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
