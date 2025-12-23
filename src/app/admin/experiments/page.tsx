'use client';

import { useEffect, useState } from 'react';
import {
  FlaskConical,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Trophy,
  AlertTriangle,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';

interface Variant {
  name: string;
  description: string;
  config: Record<string, any>;
  weight: number;
}

interface VariantStats {
  name: string;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  probability_best: number;
  uplift_vs_control?: number;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  metric: string;
  variants: Variant[];
  traffic_percent: number;
  status: 'running' | 'paused' | 'completed' | 'archived';
  min_sample_size: number;
  confidence_threshold: number;
  winner?: string;
  created_at: string;
}

interface ExperimentResults {
  experiment_id: string;
  experiment_name: string;
  status: string;
  metric: string;
  variants: VariantStats[];
  winner?: string;
  confidence: number;
  can_decide: boolean;
  recommendation: string;
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/experiments`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      if (res.ok) {
        setExperiments(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/experiments/${id}/results`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  const updateExperiment = async (id: string, updates: Partial<Experiment>) => {
    try {
      await fetch(`${API_URL}/api/v1/experiments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(updates),
      });
      fetchExperiments();
    } catch (err) {
      console.error('Failed to update experiment:', err);
    }
  };

  const autoPromote = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/experiments/auto-promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Auto-promote: ${data.summary}`);
        fetchExperiments();
      }
    } catch (err) {
      console.error('Failed to auto-promote:', err);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  useEffect(() => {
    if (selectedExperiment) {
      fetchResults(selectedExperiment);
    }
  }, [selectedExperiment]);

  const statusColors: Record<string, string> = {
    running: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">A/B Experiments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Run controlled experiments and analyze results
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={autoPromote}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Trophy className="w-4 h-4" />
            Auto-Promote Winners
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
          <button
            onClick={fetchExperiments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Running"
          count={experiments.filter(e => e.status === 'running').length}
          icon={Play}
          color="green"
        />
        <StatCard
          label="Paused"
          count={experiments.filter(e => e.status === 'paused').length}
          icon={Pause}
          color="yellow"
        />
        <StatCard
          label="Completed"
          count={experiments.filter(e => e.status === 'completed').length}
          icon={Trophy}
          color="blue"
        />
        <StatCard
          label="Total"
          count={experiments.length}
          icon={FlaskConical}
          color="slate"
        />
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experiment List */}
        <div className="space-y-4">
          <h2 className="font-semibold">Experiments</h2>

          {experiments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">No experiments yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 hover:underline"
              >
                Create your first experiment
              </button>
            </div>
          ) : (
            experiments.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExperiment(exp.id)}
                className={`p-4 bg-white dark:bg-slate-800 rounded-xl border cursor-pointer transition-all ${
                  selectedExperiment === exp.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exp.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[exp.status]}`}>
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {exp.description || exp.hypothesis}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{exp.variants.length} variants</span>
                      <span>{exp.traffic_percent}% traffic</span>
                      <span>Metric: {exp.metric}</span>
                    </div>
                  </div>

                  {exp.winner && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm">{exp.winner}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {exp.status === 'running' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateExperiment(exp.id, { status: 'paused' });
                      }}
                      className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded hover:bg-yellow-200"
                    >
                      Pause
                    </button>
                  )}
                  {exp.status === 'paused' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateExperiment(exp.id, { status: 'running' });
                      }}
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <h2 className="font-semibold">Results</h2>

          {selectedExperiment && results ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div>
                <h3 className="font-medium text-lg">{results.experiment_name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Metric: {results.metric}</p>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg ${
                results.can_decide
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-start gap-2">
                  {results.can_decide ? (
                    <Trophy className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{results.recommendation}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Confidence: {(results.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Stats */}
              <div className="space-y-4">
                {results.variants.map((v, i) => (
                  <div
                    key={v.name}
                    className={`p-4 rounded-lg border ${
                      v.name === results.winner
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{v.name}</span>
                        {i === 0 && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            Control
                          </span>
                        )}
                        {v.name === results.winner && (
                          <Trophy className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {(v.probability_best * 100).toFixed(1)}% chance best
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{v.visitors}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Visitors</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{v.conversions}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Conversions</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{(v.conversion_rate * 100).toFixed(2)}%</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Rate</p>
                      </div>
                    </div>

                    {v.uplift_vs_control !== null && v.uplift_vs_control !== undefined && (
                      <div className={`mt-3 text-center text-sm ${
                        v.uplift_vs_control > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {v.uplift_vs_control > 0 ? '+' : ''}{(v.uplift_vs_control * 100).toFixed(1)}% vs control
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">
                Select an experiment to view results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateExperimentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchExperiments();
          }}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  icon: Icon,
  color
}: {
  label: string;
  count: number;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function CreateExperimentModal({
  onClose,
  onCreated,
  apiUrl
}: {
  onClose: () => void;
  onCreated: () => void;
  apiUrl: string;
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    hypothesis: '',
    metric: 'chat_engagement',
    traffic_percent: 10,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/v1/experiments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          ...form,
          variants: [
            { name: 'control', description: 'Current behavior', config: {}, weight: 1 },
            { name: 'treatment', description: 'New behavior', config: {}, weight: 1 },
          ],
          min_sample_size: 100,
          confidence_threshold: 0.95,
        }),
      });

      if (res.ok) {
        onCreated();
      }
    } catch (err) {
      console.error('Failed to create experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create Experiment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
              placeholder="e.g., Detailed Dosing V1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hypothesis</label>
            <textarea
              value={form.hypothesis}
              onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
              rows={2}
              placeholder="e.g., More detailed dosing info will increase source clicks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Metric</label>
            <select
              value={form.metric}
              onChange={(e) => setForm({ ...form, metric: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
            >
              <option value="chat_engagement">Chat Engagement</option>
              <option value="source_clicks">Source Clicks</option>
              <option value="return_rate">Return Rate</option>
              <option value="session_duration">Session Duration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Traffic Allocation: {form.traffic_percent}%
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={form.traffic_percent}
              onChange={(e) => setForm({ ...form, traffic_percent: Number(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Percentage of users who will see the experiment
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
