'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink,
  RefreshCw,
  ShoppingCart,
  ArrowRight,
  Users,
  TrendingUp,
  MousePointerClick,
  RotateCcw
} from 'lucide-react';

interface AffiliateStats {
  time_range_days: number;
  totals: {
    clicks: number;
    returns: number;
    purchases: number;
    return_rate: number;
    purchase_rate: number;
  };
  by_vendor: {
    vendor: string;
    clicks: number;
    returns: number;
    purchases: number;
    return_rate: number;
    purchase_rate: number;
  }[];
  by_peptide: {
    peptide: string;
    clicks: number;
    returns: number;
    purchases: number;
  }[];
}

export default function AffiliatesPage() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/analytics/affiliate/stats?days=${timeRange}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });

      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch affiliate stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Attribution</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track research to purchase to experience journey
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Funnel Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Attribution Funnel</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Research peptide → Click vendor link → Return to app → Share experience
        </p>

        <div className="flex items-center justify-between gap-4">
          {/* Clicks */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <MousePointerClick className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{stats?.totals.clicks || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vendor Clicks</p>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-400 flex-shrink-0" />

          {/* Returns */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <RotateCcw className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{stats?.totals.returns || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Returned ({((stats?.totals.return_rate || 0) * 100).toFixed(0)}%)
            </p>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-400 flex-shrink-0" />

          {/* Purchases */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold">{stats?.totals.purchases || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Purchased ({((stats?.totals.purchase_rate || 0) * 100).toFixed(0)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Vendor */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">By Vendor</h2>

          {stats?.by_vendor && stats.by_vendor.length > 0 ? (
            <div className="space-y-4">
              {stats.by_vendor.map((vendor) => (
                <div
                  key={vendor.vendor}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{vendor.vendor}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {vendor.clicks} clicks
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Returns</p>
                      <p className="font-medium">
                        {vendor.returns} ({(vendor.return_rate * 100).toFixed(0)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Purchases</p>
                      <p className="font-medium">
                        {vendor.purchases} ({(vendor.purchase_rate * 100).toFixed(0)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Conversion</p>
                      <p className={`font-medium ${
                        vendor.purchase_rate > 0.1
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {(vendor.purchase_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-green-500"
                        style={{ width: `${vendor.purchase_rate * 100}%` }}
                      />
                      <div
                        className="bg-purple-500"
                        style={{ width: `${(vendor.return_rate - vendor.purchase_rate) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Purchased
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      Returned (no purchase)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <ExternalLink className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No vendor data yet</p>
              <p className="text-sm mt-1">Track outbound clicks to vendor sites</p>
            </div>
          )}
        </div>

        {/* By Peptide */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">By Peptide</h2>

          {stats?.by_peptide && stats.by_peptide.length > 0 ? (
            <div className="space-y-3">
              {stats.by_peptide.map((peptide) => (
                <div
                  key={peptide.peptide}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{peptide.peptide}</span>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {peptide.clicks} clicks → {peptide.returns} returns → {peptide.purchases} purchases
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {peptide.clicks > 0 ? ((peptide.purchases / peptide.clicks) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">conversion</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No peptide data yet</p>
              <p className="text-sm mt-1">See which peptides drive purchases</p>
            </div>
          )}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">How Affiliate Attribution Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">1. Research</div>
            <p className="text-slate-600 dark:text-slate-400">
              User researches a peptide using the chat interface
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-medium text-purple-700 dark:text-purple-400 mb-2">2. Click Out</div>
            <p className="text-slate-600 dark:text-slate-400">
              User clicks a vendor link to explore purchasing options
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="font-medium text-orange-700 dark:text-orange-400 mb-2">3. Return</div>
            <p className="text-slate-600 dark:text-slate-400">
              User returns to the app after visiting the vendor site
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-medium text-green-700 dark:text-green-400 mb-2">4. Journey</div>
            <p className="text-slate-600 dark:text-slate-400">
              User confirms purchase and starts tracking their experience
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>API Integration:</strong> Use <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">POST /api/v1/analytics/affiliate/click</code> when
            users click outbound links, and <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">POST /api/v1/analytics/affiliate/return</code> when
            they return and confirm a purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
