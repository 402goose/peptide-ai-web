'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  AlertCircle,
  Clock,
  Send,
  Mail,
  Loader2
} from 'lucide-react';

interface Feedback {
  id: string;
  component_name: string;
  component_path: string;
  conversation: Array<{ role: string; content: string }>;
  summary: string;
  product_prompt: string;
  insights: string[];
  priority: 'low' | 'medium' | 'high';
  category: 'bug' | 'feature' | 'ux' | 'content' | 'other';
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
  user_context?: {
    page?: string;
    persona_id?: string;
    satisfaction?: number;
  };
  user_email?: string;
  user_id?: string;
  notified_at?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  reviewed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  implemented: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  dismissed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const categoryIcons: Record<string, string> = {
  bug: '🐛',
  feature: '✨',
  ux: '🎨',
  content: '📝',
  other: '💬',
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    category: '',
    source: '', // 'persona' or 'user'
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Selection and notification state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm] = useState({
    updateTitle: '',
    updateMessage: '',
    testInstructions: '',
  });
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.category) params.append('category', filter.category);

      console.log('Fetching feedback from:', `${API_URL}/api/v1/feedback?${params.toString()}`);

      const res = await fetch(`${API_URL}/api/v1/feedback?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Feedback fetched:', data.length, 'items');
        setFeedback(data);
      } else {
        const errorText = await res.text();
        console.error('Feedback fetch error:', res.status, errorText);
        setFetchError(`API error: ${res.status} - ${errorText.slice(0, 100)}`);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setFetchError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API_URL}/api/v1/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ status }),
      });
      fetchFeedback();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  // Selection helpers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredFeedback.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFeedback.map(f => f.id)));
    }
  };

  // Get selected feedback items that can be notified (have user_id and not anonymous)
  const notifiableSelected = feedback.filter(
    f => selectedIds.has(f.id) && f.user_id && f.user_id !== 'anonymous'
  );

  // Send notification
  const sendNotification = async () => {
    if (notifiableSelected.length === 0) return;

    setNotifying(true);
    setNotifyResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/feedback/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          feedback_ids: notifiableSelected.map(f => f.id),
          update_title: notifyForm.updateTitle,
          update_message: notifyForm.updateMessage,
          test_instructions: notifyForm.testInstructions || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotifyResult({
          success: true,
          message: `Notified ${data.notified_count} users. ${data.skipped_count} skipped (anonymous). ${data.conversations_created.length} conversations created.`,
        });
        // Clear selection and refresh
        setSelectedIds(new Set());
        fetchFeedback();
      } else {
        setNotifyResult({
          success: false,
          message: data.detail || 'Failed to send notifications',
        });
      }
    } catch (err) {
      setNotifyResult({
        success: false,
        message: 'Network error sending notifications',
      });
    } finally {
      setNotifying(false);
    }
  };

  // Helper to check if feedback is from a persona
  const isPersonaFeedback = (f: Feedback) => !!f.user_context?.persona_id;

  // Filter by source (client-side)
  const filteredFeedback = feedback.filter(f => {
    if (filter.source === 'persona') return isPersonaFeedback(f);
    if (filter.source === 'user') return !isPersonaFeedback(f);
    return true;
  });

  const groupedByStatus = {
    new: filteredFeedback.filter(f => f.status === 'new'),
    reviewed: filteredFeedback.filter(f => f.status === 'reviewed'),
    implemented: filteredFeedback.filter(f => f.status === 'implemented'),
    dismissed: filteredFeedback.filter(f => f.status === 'dismissed'),
  };

  // Stats by source
  const personaCount = feedback.filter(isPersonaFeedback).length;
  const userCount = feedback.filter(f => !isPersonaFeedback(f)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage user and persona feedback
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowNotifyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Send Update ({selectedIds.size})
            </button>
          )}
          <button
            onClick={fetchFeedback}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="implemented">Implemented</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">All Categories</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="ux">UX</option>
          <option value="content">Content</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filter.source}
          onChange={(e) => setFilter({ ...filter, source: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">All Sources</option>
          <option value="persona">🤖 Test Personas</option>
          <option value="user">👤 Real Users</option>
        </select>

        {/* Select All */}
        {filteredFeedback.length > 0 && (
          <button
            onClick={selectAll}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {selectedIds.size === filteredFeedback.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="New" count={groupedByStatus.new.length} color="blue" />
        <StatCard label="Reviewed" count={groupedByStatus.reviewed.length} color="yellow" />
        <StatCard label="Implemented" count={groupedByStatus.implemented.length} color="green" />
        <StatCard label="Dismissed" count={groupedByStatus.dismissed.length} color="slate" />
        <StatCard label="🤖 Personas" count={personaCount} color="purple" />
        <StatCard label="👤 Users" count={userCount} color="teal" />
      </div>

      {/* Error Display */}
      {fetchError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-medium">Error fetching feedback</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400">No feedback found</p>
            <p className="text-xs text-slate-400 mt-2">
              API URL: {API_URL}
            </p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden transition-colors ${
                selectedIds.has(item.id)
                  ? 'border-green-500 dark:border-green-400 ring-1 ring-green-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />

                  {/* Content - clickable to expand */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Source badge */}
                      {isPersonaFeedback(item) ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                          🤖 Persona
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-medium">
                          👤 User
                        </span>
                      )}
                      <span className="text-lg">{categoryIcons[item.category] || '💬'}</span>
                      <span className="font-medium truncate">{item.component_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                      {item.notified_at && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Notified
                        </span>
                      )}
                      {item.user_email && (
                        <span className="text-xs text-slate-400" title={item.user_email}>
                          <Mail className="w-3 h-3 inline" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.summary}
                    </p>
                    {item.user_context?.persona_id && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                          Persona: {item.user_context.persona_id}
                        </span>
                        {item.user_context.satisfaction && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Satisfaction: {item.user_context.satisfaction}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {expandedId === item.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
                  {/* Raw Conversation */}
                  {item.conversation && item.conversation.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Original Conversation</h4>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                        {item.conversation.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 text-sm ${
                              msg.role === 'user'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-300 dark:border-slate-600'
                            } ${i > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}
                          >
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1 block">
                              {msg.role}
                            </span>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {item.insights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {item.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Product Prompt */}
                  {item.product_prompt && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Product Prompt</h4>
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm whitespace-pre-wrap font-mono">
                        {item.product_prompt}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">Status:</span>
                    <button
                      onClick={() => updateStatus(item.id, 'reviewed')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        item.status === 'reviewed'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                      }`}
                    >
                      Reviewed
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, 'implemented')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        item.status === 'implemented'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                    >
                      Implemented
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, 'dismissed')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        item.status === 'dismissed'
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Send Update Notification</h3>
                  <p className="text-xs text-slate-500">
                    {notifiableSelected.length} user(s) will be notified
                    {selectedIds.size - notifiableSelected.length > 0 && (
                      <span className="text-yellow-600"> ({selectedIds.size - notifiableSelected.length} anonymous/skipped)</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                  setNotifyResult(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {notifyResult ? (
                <div className={`p-4 rounded-lg ${
                  notifyResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <p className="font-medium">{notifyResult.success ? 'Success!' : 'Error'}</p>
                  <p className="text-sm mt-1">{notifyResult.message}</p>
                  <button
                    onClick={() => {
                      setShowNotifyModal(false);
                      setNotifyResult(null);
                      setNotifyForm({ updateTitle: '', updateMessage: '', testInstructions: '' });
                    }}
                    className="mt-3 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Update Title</label>
                    <input
                      type="text"
                      value={notifyForm.updateTitle}
                      onChange={(e) => setNotifyForm({ ...notifyForm, updateTitle: e.target.value })}
                      placeholder="e.g., Calculator Improvements"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">What Changed</label>
                    <textarea
                      value={notifyForm.updateMessage}
                      onChange={(e) => setNotifyForm({ ...notifyForm, updateMessage: e.target.value })}
                      placeholder="Describe the changes you made in response to their feedback..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Test Instructions (optional)</label>
                    <textarea
                      value={notifyForm.testInstructions}
                      onChange={(e) => setNotifyForm({ ...notifyForm, testInstructions: e.target.value })}
                      placeholder="How should they test the changes?"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowNotifyModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendNotification}
                      disabled={!notifyForm.updateTitle || !notifyForm.updateMessage || notifying || notifiableSelected.length === 0}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {notifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send to {notifiableSelected.length} User(s)
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    slate: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
