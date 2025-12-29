'use client'

import { useState } from 'react'
import {
  ShoppingCart, CheckCircle2, Star, Clock, Shield,
  ExternalLink, ChevronDown, ChevronUp, AlertTriangle,
  TrendingUp, Package, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface VendorRecommendationsProps {
  peptides: string[]
  userGoals?: string[]
  className?: string
}

interface Vendor {
  id: string
  name: string
  rating: number
  reviewCount: number
  hasCOA: boolean
  hasThirdPartyTesting: boolean
  shipping: string[]
  shippingTime: string
  priceLevel: 'budget' | 'mid' | 'premium'
  specialties: string[]
  peptideAvailability: { [peptide: string]: boolean }
  affiliateUrl: string
  highlights: string[]
  warnings?: string[]
}

// Vendor data - Replace affiliate URLs with your actual affiliate links
const VENDORS: Vendor[] = [
  {
    id: 'peptide-sciences',
    name: 'Peptide Sciences',
    rating: 4.8,
    reviewCount: 2341,
    hasCOA: true,
    hasThirdPartyTesting: true,
    shipping: ['US'],
    shippingTime: '3-5 business days',
    priceLevel: 'mid',
    specialties: ['Research peptides', 'Healing peptides'],
    peptideAvailability: {
      'BPC-157': true,
      'TB-500': true,
      'Thymosin Alpha-1': true,
      'GHK-Cu': true,
      'Ipamorelin': true,
      'CJC-1295': true,
      'Tesamorelin': true,
      'AOD-9604': true,
    },
    affiliateUrl: 'https://www.peptidesciences.com/?ref=peptideai',
    highlights: [
      'US-based with fast shipping',
      'Comprehensive COA for each batch',
      'Strong reputation in the community',
    ],
  },
  {
    id: 'swiss-chems',
    name: 'Swiss Chems',
    rating: 4.6,
    reviewCount: 1876,
    hasCOA: true,
    hasThirdPartyTesting: true,
    shipping: ['US', 'EU', 'UK', 'CA', 'AU'],
    shippingTime: '5-10 business days',
    priceLevel: 'mid',
    specialties: ['SARMs', 'Research peptides', 'Nootropics'],
    peptideAvailability: {
      'BPC-157': true,
      'TB-500': true,
      'Semaglutide': true,
      'Tirzepatide': true,
      'Semax': true,
      'Selank': true,
      'MK-677': true,
      'SR9009': true,
    },
    affiliateUrl: 'https://swisschems.is/?ref=peptideai',
    highlights: [
      'International shipping available',
      'Wide product selection',
      'Bitcoin payment accepted',
    ],
  },
  {
    id: 'amino-asylum',
    name: 'Amino Asylum',
    rating: 4.4,
    reviewCount: 1234,
    hasCOA: true,
    hasThirdPartyTesting: false,
    shipping: ['US'],
    shippingTime: '3-7 business days',
    priceLevel: 'budget',
    specialties: ['Budget peptides', 'SARMs'],
    peptideAvailability: {
      'BPC-157': true,
      'TB-500': true,
      'Ipamorelin': true,
      'GHRP-6': true,
      'CJC-1295': true,
      'MK-677': true,
    },
    affiliateUrl: 'https://aminoasylum.com/?ref=peptideai',
    highlights: [
      'Competitive pricing',
      'Frequent sales and discounts',
    ],
    warnings: ['Third-party testing not always available'],
  },
  {
    id: 'limitless-life',
    name: 'Limitless Life Nootropics',
    rating: 4.7,
    reviewCount: 892,
    hasCOA: true,
    hasThirdPartyTesting: true,
    shipping: ['US', 'CA'],
    shippingTime: '3-5 business days',
    priceLevel: 'mid',
    specialties: ['Cognitive peptides', 'Nasal sprays'],
    peptideAvailability: {
      'Semax': true,
      'Selank': true,
      'Dihexa': true,
      'Epithalon': true,
      'BPC-157': true,
      'GHK-Cu': true,
    },
    affiliateUrl: 'https://limitlesslifenootropics.com/?ref=peptideai',
    highlights: [
      'Specializes in cognitive peptides',
      'Pre-mixed nasal sprays available',
      'Excellent customer service',
    ],
  },
]

export function VendorRecommendations({
  peptides,
  userGoals,
  className,
}: VendorRecommendationsProps) {
  const [expanded, setExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'availability'>('rating')

  // Filter and sort vendors based on peptides user is interested in
  const relevantVendors = VENDORS
    .map(vendor => {
      const availableCount = peptides.filter(p => vendor.peptideAvailability[p]).length
      return { ...vendor, availableCount, availabilityPercent: availableCount / peptides.length }
    })
    .filter(v => v.availableCount > 0)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') {
        const priceOrder = { budget: 0, mid: 1, premium: 2 }
        return priceOrder[a.priceLevel] - priceOrder[b.priceLevel]
      }
      return b.availabilityPercent - a.availabilityPercent
    })

  const displayVendors = expanded ? relevantVendors : relevantVendors.slice(0, 2)

  return (
    <div className={cn("rounded-xl border border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-orange-200/50 dark:border-orange-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Recommended Vendors
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vetted suppliers with COA verification
              </p>
            </div>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
          >
            <option value="rating">Highest Rated</option>
            <option value="price">Lowest Price</option>
            <option value="availability">Best Match</option>
          </select>
        </div>

        {/* What you're looking for */}
        {peptides.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Looking for:</span>
            {peptides.slice(0, 4).map((peptide, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                {peptide}
              </span>
            ))}
            {peptides.length > 4 && (
              <span className="text-xs text-slate-400">+{peptides.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      {/* Vendor List */}
      <div className="divide-y divide-orange-200/50 dark:divide-orange-800/30">
        {displayVendors.map((vendor, index) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            peptides={peptides}
            isTopPick={index === 0}
          />
        ))}
      </div>

      {/* Show more/less */}
      {relevantVendors.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-colors"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show {relevantVendors.length - 2} More <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      )}

      {/* Disclaimer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-orange-200/50 dark:border-orange-800/30">
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <p>
            Peptide legality varies by jurisdiction. These vendors sell for research purposes only.
            We may earn a commission from purchases made through these links.
          </p>
        </div>
      </div>
    </div>
  )
}

function VendorCard({
  vendor,
  peptides,
  isTopPick,
}: {
  vendor: Vendor & { availableCount: number; availabilityPercent: number }
  peptides: string[]
  isTopPick: boolean
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="p-4">
      {/* Top Pick Badge */}
      {isTopPick && (
        <div className="flex items-center gap-1 mb-2">
          <Award className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            Top Pick for Your Selection
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Vendor name and rating */}
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {vendor.name}
            </h4>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{vendor.rating}</span>
              <span className="text-xs text-slate-400">({vendor.reviewCount})</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {vendor.hasCOA && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                COA Verified
              </span>
            )}
            {vendor.hasThirdPartyTesting && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Shield className="h-3 w-3" />
                3rd Party Tested
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {vendor.shippingTime}
            </span>
          </div>

          {/* Availability indicator */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {vendor.availableCount}/{peptides.length} peptides available
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden max-w-[100px]">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${vendor.availabilityPercent * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          {vendor.highlights && showDetails && (
            <ul className="mt-3 space-y-1">
              {vendor.highlights.map((highlight, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          {/* Warnings */}
          {vendor.warnings && showDetails && (
            <ul className="mt-2 space-y-1">
              {vendor.warnings.map((warning, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-end gap-2">
          <a
            href={vendor.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async (e) => {
              // Track the click (non-blocking)
              try {
                await api.trackAffiliateClick({
                  product_id: vendor.id,
                  source: 'stacks',
                })
              } catch (err) {
                // Don't block navigation on tracking failure
                console.warn('Failed to track affiliate click:', err)
              }
            }}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            View <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {showDetails ? 'Less' : 'More'} info
          </button>
        </div>
      </div>
    </div>
  )
}
