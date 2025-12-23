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
  Star
} from 'lucide-react';

interface PersonaSession {
  session_num: number;
  actions_taken: number;
  duration_seconds: number;
  chats: number;
  peptides_researched: string[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peptide-ai-api-production.up.railway.app';

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/analytics/persona-tests`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' && data.results) {
          setResults(data.results);
        } else {
          setError(data.message || 'No results available');
        }
      } else {
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

      {results && (
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

      {!loading && !results && !error && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">No persona test results available</p>
          <p className="text-sm text-slate-400 mt-2">
            Run the browser agent test to generate results
          </p>
        </div>
      )}
    </div>
  );
}
