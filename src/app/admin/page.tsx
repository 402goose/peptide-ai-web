'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';

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

interface FunnelStep {
  name: string;
  count: number;
  conversion_rate: number;
}

interface PersonaComparison {
  real_users: {
    avg_chats_per_session: number;
    return_rate: number;
    active_users_30d: number;
  };
  persona_tests: {
    avg_chats_per_session: number;
    return_rate: number;
    satisfaction: number;
  };
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [comparison, setComparison] = useState<PersonaComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);
  const [clearingShares, setClearingShares] = useState(false);
  const [clearSharesResult, setClearSharesResult] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const handleClearAllConversations = async () => {
    if (!confirm('Are you sure you want to delete ALL conversations? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    setClearResult(null);

    try {
      const result = await api.deleteAllConversations();
      setClearResult(`Successfully deleted ${result.deleted} conversations`);
    } catch (err) {
      console.error('Failed to clear conversations:', err);
      setClearResult('Failed to clear conversations. Check console for details.');
    } finally {
      setClearing(false);
    }
  };

  const handleClearSharedConversations = async (all: boolean = false) => {
    const message = all
      ? 'Delete ALL shared conversation links?'
      : 'Delete shared links older than 3 days?';

    if (!confirm(message)) {
      return;
    }

    setClearingShares(true);
    setClearSharesResult(null);

    try {
      const endpoint = all ? 'deleteAllSharedConversations' : 'cleanupOldSharedConversations';
      const result = await api[endpoint]();
      setClearSharesResult(`Successfully deleted ${result.deleted} shared links`);
    } catch (err) {
      console.error('Failed to clear shared conversations:', err);
      setClearSharesResult('Failed to clear shared links. Check console for details.');
    } finally {
      setClearingShares(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      };

      // Fetch all data in parallel
      const [metricsRes, funnelRes, comparisonRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analytics/metrics?days=7`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/analytics/funnel`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/analytics/compare-to-personas`, { headers }).catch(() => null),
      ]);

      if (metricsRes?.ok) {
        setMetrics(await metricsRes.json());
      }

      if (funnelRes?.ok) {
        const data = await funnelRes.json();
        setFunnel(data.steps || []);
      }

      if (comparisonRes?.ok) {
        setComparison(await comparisonRes.json());
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {trend === 'up' && <ArrowUpRight size={16} />}
            {trend === 'down' && <ArrowDownRight size={16} />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of key metrics and performance
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Users (7d)"
          value={metrics?.active_users || 0}
          icon={Users}
        />
        <StatCard
          title="Total Chats"
          value={metrics?.total_chats || 0}
          icon={MessageSquare}
        />
        <StatCard
          title="Avg Chats/User"
          value={metrics?.avg_chats_per_user?.toFixed(1) || '0'}
          icon={BarChart3}
        />
        <StatCard
          title="Return Rate"
          value={`${((metrics?.return_rate || 0) * 100).toFixed(0)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Funnel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
        {funnel.length > 0 ? (
          <div className="space-y-3">
            {funnel.map((step, index) => (
              <div key={step.name} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600 dark:text-slate-400">
                  {step.name}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-500"
                      style={{ width: `${step.conversion_rate * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="font-medium">{step.count}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
                    ({(step.conversion_rate * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">No funnel data available yet</p>
        )}
      </div>

      {/* Real vs Persona Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Real Users vs Persona Tests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Validates that persona testing reflects actual user behavior
        </p>

        {comparison ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Chats per Session</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Real Users</span>
                  <span className="font-medium">{(comparison.real_users?.avg_chats_per_session ?? 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Persona Tests</span>
                  <span className="font-medium">{(comparison.persona_tests?.avg_chats_per_session ?? 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Return Rate</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Real Users</span>
                  <span className="font-medium">{((comparison.real_users?.return_rate ?? 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Persona Tests</span>
                  <span className="font-medium">{((comparison.persona_tests?.return_rate ?? 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Persona Satisfaction</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{(comparison.persona_tests?.satisfaction ?? 0).toFixed(1)}</span>
                <span className="text-slate-500 dark:text-slate-400">/ 10</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Target: 8.0</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">No comparison data available</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/feedback"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium">View Feedback</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review user and persona feedback
          </p>
        </a>

        <a
          href="/admin/experiments"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium">A/B Experiments</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and analyze experiments
          </p>
        </a>

        <a
          href="/admin/personas"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium">Persona Tests</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View latest persona test results
          </p>
        </a>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-900">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <h3 className="font-medium">Clear All Conversations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Delete all chat conversations from the database. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClearAllConversations}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className={`w-4 h-4 ${clearing ? 'animate-pulse' : ''}`} />
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>

        {clearResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            clearResult.includes('Successfully')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {clearResult}
          </div>
        )}

        {/* Clear Shared Links */}
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
          <div>
            <h3 className="font-medium">Clear Shared Links</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Delete shared conversation links from the database.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleClearSharedConversations(false)}
              disabled={clearingShares}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm"
            >
              {clearingShares ? 'Clearing...' : 'Old (3+ days)'}
            </button>
            <button
              onClick={() => handleClearSharedConversations(true)}
              disabled={clearingShares}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
            >
              <Trash2 className={`w-4 h-4 ${clearingShares ? 'animate-pulse' : ''}`} />
              {clearingShares ? 'Clearing...' : 'All'}
            </button>
          </div>
        </div>

        {clearSharesResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            clearSharesResult.includes('Successfully')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {clearSharesResult}
          </div>
        )}
      </div>
    </div>
  );
}
