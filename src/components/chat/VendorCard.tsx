'use client'

import { ExternalLink, Shield, Star, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VendorInfo {
  id: string
  name: string
  rating: number // 1-5
  verifiedCOA: boolean
  thirdPartyTested: boolean
  shipsTo: string[]
  priceRange: 'budget' | 'mid' | 'premium'
  affiliateLink?: string
  disclaimer?: string
}

interface VendorCardProps {
  vendor: VendorInfo
  onLearnMore?: (vendorId: string) => void
}

export function VendorCard({ vendor, onLearnMore }: VendorCardProps) {
  const handleAffiliateClick = () => {
    // Track affiliate click
    if (typeof window !== 'undefined') {
      // Send analytics event
      console.log('[Affiliate] Click tracked:', vendor.id)

      // Store click in localStorage for attribution
      const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]')
      clicks.push({
        vendorId: vendor.id,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-100)))
    }

    // Open affiliate link
    if (vendor.affiliateLink) {
      window.open(vendor.affiliateLink, '_blank', 'noopener,noreferrer')
    }
  }

  const getPriceLabel = (range: string) => {
    switch (range) {
      case 'budget': return '$'
      case 'mid': return '$$'
      case 'premium': return '$$$'
      default: return '$$'
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {vendor.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < vendor.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {getPriceLabel(vendor.priceRange)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {vendor.verifiedCOA && (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            COA Verified
          </div>
        )}
        {vendor.thirdPartyTested && (
          <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Shield className="h-3 w-3" />
            3rd Party Tested
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Ships to: {vendor.shipsTo.join(', ')}
      </div>

      {vendor.affiliateLink && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleAffiliateClick}
        >
          <span>Visit Vendor</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}

      {vendor.disclaimer && (
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          {vendor.disclaimer}
        </p>
      )}
    </div>
  )
}

// Vendor comparison component
interface VendorComparisonProps {
  vendors: VendorInfo[]
  title?: string
}

export function VendorComparison({ vendors, title }: VendorComparisonProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      <p className="mt-3 text-[10px] text-center text-slate-400 dark:text-slate-500">
        Vendor listings may contain affiliate links. Always verify quality and legal status in your jurisdiction.
      </p>
    </div>
  )
}

// Affiliate disclaimer banner
export function AffiliateDisclaimer() {
  return (
    <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
      <p>
        <strong>Affiliate Disclosure:</strong> Some links may be affiliate links. We only recommend vendors
        with verified third-party testing and certificate of analysis (COA). Peptide legality varies by
        jurisdiction - verify local regulations before purchasing.
      </p>
    </div>
  )
}
