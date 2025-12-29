'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Clock,
  ExternalLink,
  ShoppingCart,
  Beaker
} from 'lucide-react';

interface Metrics {
  active_users: number;
  new_signups: number;
  total_sessions: number;
  total_chats: number;
  avg_chats_per_user: number;
  feedback_submissions: number;
  return_rate: number;
  time_range_days: number;
}

interface AffiliateStats {
  time_range_days: number;
  totals: {
    clicks: number;
    returns: number;
    purchases: number;
    return_rate: number;
    purchase_rate: number;
  };
  by_vendor: Array<{
    vendor: string;
    clicks: number;
    returns: number;
    purchases: number;
    return_rate: number;
    purchase_rate: number;
  }>;
  by_peptide: Array<{
    peptide: string;
    clicks: number;
    returns: number;
    purchases: number;
  }>;
}

interface FunnelStep {
  name: string;
  count: number;
  conversion_rate: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [timeRange, setTimeRange] = useState(7);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      };

      const [metricsRes, funnelRes, affiliateRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analytics/metrics?days=${timeRange}`, { headers }),
        fetch(`${API_URL}/api/v1/analytics/funnel`, { headers }),
        fetch(`${API_URL}/api/v1/analytics/affiliate/stats?days=${timeRange}`, { headers }),
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (funnelRes.ok) {
        const data = await funnelRes.json();
        setFunnel(data.steps || []);
      }
      if (affiliateRes.ok) setAffiliateStats(await affiliateRes.json());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track user behavior and engagement metrics
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time range selector */}
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
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Users"
          value={metrics?.active_users || 0}
          subtitle={`Last ${timeRange} days`}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="New Signups"
          value={metrics?.new_signups || 0}
          subtitle="New registrations"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total Chats"
          value={metrics?.total_chats || 0}
          subtitle={`${metrics?.avg_chats_per_user?.toFixed(1) || 0} avg per user`}
          icon={MessageSquare}
          color="purple"
        />
        <MetricCard
          title="Return Rate"
          value={`${((metrics?.return_rate || 0) * 100).toFixed(1)}%`}
          subtitle="Users who came back"
          icon={RefreshCw}
          color="orange"
        />
      </div>

      {/* Funnel Visualization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-6">Conversion Funnel</h2>

        {funnel.length > 0 ? (
          <div className="space-y-4">
            {funnel.map((step, index) => {
              const prevCount = index > 0 ? funnel[index - 1].count : step.count;
              const dropoff = prevCount > 0 ? ((prevCount - step.count) / prevCount * 100).toFixed(0) : 0;

              return (
                <div key={step.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{step.count.toLocaleString()}</span>
                      {index > 0 && (
                        <span className="text-red-500 text-sm ml-2">-{dropoff}%</span>
                      )}
                    </div>
                  </div>

                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${step.conversion_rate * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>{(step.conversion_rate * 100).toFixed(1)}% of visitors</span>
                    {index > 0 && (
                      <span>{((step.count / prevCount) * 100).toFixed(1)}% from previous step</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No funnel data available yet</p>
            <p className="text-sm mt-1">Start tracking events to see your conversion funnel</p>
          </div>
        )}
      </div>

      {/* Affiliate Tracking */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Affiliate & Vendor Tracking
        </h2>

        {affiliateStats && affiliateStats.totals.clicks > 0 ? (
          <div className="space-y-6">
            {/* Affiliate Totals */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{affiliateStats.totals.clicks}</p>
                <p className="text-sm text-slate-500">Total Clicks</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{affiliateStats.totals.returns}</p>
                <p className="text-sm text-slate-500">Returns</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{affiliateStats.totals.purchases}</p>
                <p className="text-sm text-slate-500">Purchases</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-2xl font-bold">{(affiliateStats.totals.return_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Return Rate</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{(affiliateStats.totals.purchase_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Purchase Rate</p>
              </div>
            </div>

            {/* By Vendor */}
            {affiliateStats.by_vendor.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">By Vendor</h3>
                <div className="space-y-2">
                  {affiliateStats.by_vendor.map((vendor) => (
                    <div key={vendor.vendor} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{vendor.vendor}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{vendor.clicks} clicks</span>
                        <span className="text-green-600">{vendor.returns} returns</span>
                        <span className="text-purple-600">{vendor.purchases} purchases</span>
                        <span className="text-emerald-600 font-medium">{(vendor.purchase_rate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Peptide */}
            {affiliateStats.by_peptide.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">By Peptide</h3>
                <div className="flex flex-wrap gap-2">
                  {affiliateStats.by_peptide.map((item) => (
                    <div key={item.peptide} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm">
                      <Beaker className="w-3 h-3" />
                      <span className="font-medium">{item.peptide}</span>
                      <span className="text-slate-500">({item.clicks})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <ExternalLink className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No affiliate clicks tracked yet</p>
            <p className="text-sm mt-1">Clicks to vendor links will appear here</p>
          </div>
        )}
      </div>

      {/* Event Tracking Reference */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Event Types Tracked</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          These events are automatically tracked to measure user engagement
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EventTypeCard
            title="Page View"
            description="User visits any page"
            category="Acquisition"
          />
          <EventTypeCard
            title="Sign Up Complete"
            description="User creates an account"
            category="Acquisition"
          />
          <EventTypeCard
            title="First Chat"
            description="User sends first message"
            category="Activation"
          />
          <EventTypeCard
            title="Chat Sent"
            description="Any chat message sent"
            category="Engagement"
          />
          <EventTypeCard
            title="Source Clicked"
            description="User clicks a research source"
            category="Engagement"
          />
          <EventTypeCard
            title="Return Visit"
            description="User comes back to app"
            category="Retention"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

function EventTypeCard({
  title,
  description,
  category
}: {
  title: string;
  description: string;
  category: string;
}) {
  const categoryColors: Record<string, string> = {
    'Acquisition': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Activation': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Engagement': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Retention': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{title}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[category] || ''}`}>
          {category}
        </span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
