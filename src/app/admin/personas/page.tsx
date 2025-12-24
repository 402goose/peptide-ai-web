'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Star,
  MousePointerClick,
  BookOpen,
  ExternalLink,
  Timer,
  FlaskConical,
  Zap
} from 'lucide-react';

interface PersonaSession {
  session_num: number;
  actions_taken: number;
  duration_seconds: number;
  chats: number;
  peptides_researched: string[];
}

// New chat UI agent metrics format
interface ChatUIMetrics {
  page_load_time_ms: number;
  time_to_first_message_ms: number;
  response_stream_time_ms: number;
  total_session_time_ms: number;
  messages_sent: number;
  follow_ups_clicked: number;
  research_card_expanded: number;
  sources_viewed: number;
  scrolled_to_sources: boolean;
  clicked_external_link: boolean;
  completed_conversation: boolean;
}

// New result format from chat_ui_agent.py
interface ChatUIResult {
  persona_id: string;
  persona_name: string;
  experiment_variant: string | null;
  timestamp: string;
  metrics: ChatUIMetrics;
  conversation_summary: string;
  satisfaction_score: number;
  errors: string[];
}

interface PersonaEvaluation {
  overall_satisfaction: number;
  would_return: boolean;
  what_worked: string;
  what_needs_improvement: string;
  specific_feedback: string;
}

interface PersonaResult {
  persona_id: string;
  persona_name: string;
  sessions: PersonaSession[];
  final_state: {
    total_chats: number;
    peptides_researched: string[];
    stacks_created: string[];
    feedback_submitted: number;
  };
  evaluation: PersonaEvaluation;
}

interface PersonaSummary {
  satisfaction: number;
  would_return: boolean;
  chats: number;
}

interface TestResults {
  timestamp: string;
  target_url: string;
  personas_tested: number;
  sessions_per_persona: number;
  summary: {
    overall_satisfaction: number;
    would_return_rate: number;
    total_sessions: number;
    by_persona: Record<string, PersonaSummary>;
  };
  results: PersonaResult[];
}

// New chat UI test results format
interface ChatUITestResults {
  timestamp: string;
  target_url: string;
  experiment_id: string | null;
  personas_tested: number;
  results: ChatUIResult[];
  variant_breakdown: Record<string, {
    count: number;
    avg_satisfaction: number;
    avg_follow_ups: number;
    avg_sources_viewed: number;
  }>;
}

const personaDescriptions: Record<string, { emoji: string; title: string; description: string }> = {
  healing_beginner: {
    emoji: '🩹',
    title: 'Healing Beginner',
    description: 'New to peptides, seeking injury recovery help'
  },
  weight_loss_mom: {
    emoji: '⚖️',
    title: 'Weight Loss Mom',
    description: 'Busy parent looking for sustainable weight management'
  },
  skeptical_researcher: {
    emoji: '🔬',
    title: 'Skeptical Researcher',
    description: 'Needs strong evidence, questions everything'
  },
  bodybuilder_advanced: {
    emoji: '💪',
    title: 'Advanced Bodybuilder',
    description: 'Experienced user seeking optimization'
  },
  biohacker_longevity: {
    emoji: '🧬',
    title: 'Biohacker',
    description: 'Tech-savvy, focused on longevity and optimization'
  },
  anxious_cautious: {
    emoji: '😰',
    title: 'Anxious & Cautious',
    description: 'Health anxiety, needs safety reassurance'
  },
  cognitive_optimizer: {
    emoji: '🧠',
    title: 'Cognitive Optimizer',
    description: 'Focus on mental performance and nootropics'
  },
  budget_practical: {
    emoji: '💵',
    title: 'Budget Practical',
    description: 'Cost-conscious, needs value proposition'
  },
};

export default function PersonasPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [chatUIResults, setChatUIResults] = useState<ChatUITestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'legacy' | 'chatui'>('chatui');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both old and new format results in parallel
      const [legacyRes, chatUIRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analytics/persona-tests`, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }),
        fetch(`${API_URL}/api/v1/analytics/chat-ui-tests`, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }).catch(() => null), // Don't fail if new endpoint doesn't exist yet
      ]);

      if (legacyRes.ok) {
        const data = await legacyRes.json();
        if (data.status === 'ok' && data.results) {
          setResults(data.results);
        }
      }

      if (chatUIRes?.ok) {
        const data = await chatUIRes.json();
        if (data.status === 'ok' && data.results) {
          setChatUIResults(data.results);
          setActiveTab('chatui'); // Switch to new tab if we have new results
        }
      }

      if (!legacyRes.ok && !chatUIRes?.ok) {
        setError('Failed to fetch persona test results');
      }
    } catch (err) {
      console.error('Failed to fetch persona tests:', err);
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const satisfactionColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const satisfactionBg = (score: number) => {
    if (score >= 8) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 7) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Persona Tests</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Automated user persona testing results
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      {(results || chatUIResults) && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('chatui')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'chatui'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Chat UI Tests
              {chatUIResults && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                  {chatUIResults.results.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('legacy')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'legacy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Legacy Tests
              {results && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">
                  {results.personas_tested}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Chat UI Test Results */}
      {activeTab === 'chatui' && chatUIResults && (
        <>
          {/* A/B Variant Breakdown */}
          {chatUIResults.experiment_id && Object.keys(chatUIResults.variant_breakdown).length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold">A/B Experiment Results</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  ({chatUIResults.experiment_id})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(chatUIResults.variant_breakdown).map(([variant, stats]) => (
                  <div
                    key={variant}
                    className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        Variant {variant}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        n={stats.count}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className={`text-lg font-bold ${satisfactionColor(stats.avg_satisfaction)}`}>
                          {stats.avg_satisfaction.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-500">Satisfaction</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stats.avg_follow_ups.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-500">Follow-ups</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {stats.avg_sources_viewed.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-500">Sources</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Follow-ups Clicked</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {chatUIResults.results.reduce((sum, r) => sum + r.metrics.follow_ups_clicked, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {(chatUIResults.results.reduce((sum, r) => sum + r.metrics.follow_ups_clicked, 0) / chatUIResults.results.length).toFixed(1)} avg per session
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sources Viewed</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {chatUIResults.results.reduce((sum, r) => sum + r.metrics.sources_viewed, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {chatUIResults.results.filter(r => r.metrics.research_card_expanded > 0).length}/{chatUIResults.results.length} expanded card
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Response Time</span>
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {(chatUIResults.results.reduce((sum, r) => sum + r.metrics.response_stream_time_ms, 0) / chatUIResults.results.length / 1000).toFixed(1)}s
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Time to complete streaming
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {((chatUIResults.results.filter(r => r.metrics.completed_conversation).length / chatUIResults.results.length) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {chatUIResults.results.filter(r => r.metrics.completed_conversation).length}/{chatUIResults.results.length} completed
              </p>
            </div>
          </div>

          {/* Individual Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chatUIResults.results.map((result, idx) => {
              const info = personaDescriptions[result.persona_id] || {
                emoji: '👤',
                title: result.persona_id,
                description: ''
              };
              const isExpanded = expandedPersona === `${result.persona_id}-${idx}`;

              return (
                <div
                  key={`${result.persona_id}-${idx}`}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => setExpandedPersona(isExpanded ? null : `${result.persona_id}-${idx}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{info.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{info.title}</span>
                            {result.experiment_variant && (
                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                                Variant {result.experiment_variant}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${satisfactionColor(result.satisfaction_score)}`}>
                            {result.satisfaction_score}/10
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {result.metrics.messages_sent} msgs
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        {result.metrics.follow_ups_clicked} follow-ups
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {result.metrics.sources_viewed} sources
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {(result.metrics.total_session_time_ms / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
                      {/* Conversation Summary */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">Conversation Summary</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {result.conversation_summary}
                        </p>
                      </div>

                      {/* Detailed Metrics Grid */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-medium mb-2">Interaction Metrics</h4>
                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{result.metrics.page_load_time_ms}ms</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Page Load</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{result.metrics.time_to_first_message_ms}ms</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">First Msg</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{result.metrics.response_stream_time_ms}ms</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Stream Time</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{result.metrics.research_card_expanded}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Card Opens</p>
                          </div>
                        </div>

                        {/* Boolean Flags */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {result.metrics.scrolled_to_sources && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Scrolled to sources
                            </span>
                          )}
                          {result.metrics.clicked_external_link && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Clicked external link
                            </span>
                          )}
                          {result.metrics.completed_conversation && (
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completed conversation
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Errors */}
                      {result.errors.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Errors</h4>
                          </div>
                          <ul className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg space-y-1">
                            {result.errors.map((err, i) => (
                              <li key={i}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Test Info */}
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
            <span>Target: {chatUIResults.target_url}</span>
            <span>|</span>
            <span>Personas: {chatUIResults.personas_tested}</span>
            {chatUIResults.experiment_id && (
              <>
                <span>|</span>
                <span>Experiment: {chatUIResults.experiment_id}</span>
              </>
            )}
            <span>|</span>
            <span>Run: {new Date(chatUIResults.timestamp).toLocaleString()}</span>
          </div>
        </>
      )}

      {/* Legacy Test Results */}
      {activeTab === 'legacy' && results && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${satisfactionBg(results.summary.overall_satisfaction)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Star className={`w-5 h-5 ${satisfactionColor(results.summary.overall_satisfaction)}`} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Satisfaction</span>
              </div>
              <p className={`text-3xl font-bold ${satisfactionColor(results.summary.overall_satisfaction)}`}>
                {results.summary.overall_satisfaction.toFixed(1)}<span className="text-lg">/10</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: 8.0</p>
            </div>

            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Would Return</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(results.summary.would_return_rate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {Math.round(results.summary.would_return_rate * results.personas_tested)}/{results.personas_tested} personas
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Personas Tested</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {results.personas_tested}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {results.sessions_per_persona} session(s) each
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Run</span>
              </div>
              <p className="text-lg font-bold">
                {new Date(results.timestamp).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(results.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Persona Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.results.map((persona) => {
              const info = personaDescriptions[persona.persona_id] || {
                emoji: '👤',
                title: persona.persona_id,
                description: ''
              };
              const isExpanded = expandedPersona === persona.persona_id;

              return (
                <div
                  key={persona.persona_id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => setExpandedPersona(isExpanded ? null : persona.persona_id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{info.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{info.title}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({persona.persona_name})
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${satisfactionColor(persona.evaluation.overall_satisfaction)}`}>
                            {persona.evaluation.overall_satisfaction}/10
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            {persona.evaluation.would_return ? (
                              <ThumbsUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <ThumbsDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {persona.evaluation.would_return ? 'Would return' : 'Would not return'}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {persona.final_state.total_chats} chats
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {persona.sessions[0]?.duration_seconds || 0}s
                      </div>
                      {persona.final_state.peptides_researched.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {persona.final_state.peptides_researched.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
                      {/* What Worked */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <h4 className="text-sm font-medium text-green-700 dark:text-green-400">What Worked</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          {persona.evaluation.what_worked}
                        </p>
                      </div>

                      {/* What Needs Improvement */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <h4 className="text-sm font-medium text-orange-700 dark:text-orange-400">What Needs Improvement</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                          {persona.evaluation.what_needs_improvement}
                        </p>
                      </div>

                      {/* Specific Feedback */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">Specific Feedback</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {persona.evaluation.specific_feedback}
                        </p>
                      </div>

                      {/* Session Details */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-medium mb-2">Session Details</h4>
                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{persona.sessions[0]?.actions_taken || 0}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Actions</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{persona.sessions[0]?.duration_seconds || 0}s</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{persona.final_state.total_chats}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Chats</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                            <p className="font-bold">{persona.final_state.feedback_submitted}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Feedback</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Common Themes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Common Feedback Themes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Frequently Praised
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    User-friendly interface and navigation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    Clear, accessible information on peptides
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    Non-judgmental, balanced tone
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    Good starting point for research
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">-</span>
                    More detailed dosing protocols needed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">-</span>
                    Clearer distinction between human/animal studies
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">-</span>
                    More comprehensive side effect information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">-</span>
                    Stack creation/recommendation features
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Info */}
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
            <span>Target: {results.target_url}</span>
            <span>|</span>
            <span>Total Sessions: {results.summary.total_sessions}</span>
            <span>|</span>
            <span>Run: {new Date(results.timestamp).toLocaleString()}</span>
          </div>
        </>
      )}

      {/* Empty state for Chat UI tab */}
      {activeTab === 'chatui' && !chatUIResults && !loading && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <MousePointerClick className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No Chat UI test results available</p>
          <p className="text-sm text-slate-400 mt-2">
            Run: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">python testing/chat_ui_agent.py</code>
          </p>
        </div>
      )}

      {/* Empty state for Legacy tab */}
      {activeTab === 'legacy' && !results && !loading && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No legacy persona test results available</p>
          <p className="text-sm text-slate-400 mt-2">
            Run: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">python testing/browser_agent.py</code>
          </p>
        </div>
      )}

      {!loading && !results && !chatUIResults && !error && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No persona test results available</p>
          <p className="text-sm text-slate-400 mt-2">
            Run the browser agent test to generate results
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-400">
              <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">python testing/chat_ui_agent.py --show</code>
              <span className="ml-2">UI interaction tests</span>
            </p>
            <p className="text-xs text-slate-400">
              <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">python testing/browser_agent.py</code>
              <span className="ml-2">Legacy API tests</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
