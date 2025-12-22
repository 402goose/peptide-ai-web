'use client'

import { cn } from '@/lib/utils'

// Simple bar chart component
interface BarChartProps {
  data: Array<{
    label: string
    value: number
    maxValue?: number
    color?: string
  }>
  title?: string
  unit?: string
}

export function BarChart({ data, title, unit = '%' }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.maxValue || d.value))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
      )}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {item.value}{unit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3b82f6',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Comparison table for peptides
interface ComparisonTableProps {
  items: Array<{
    name: string
    values: Record<string, string | number>
  }>
  columns: Array<{
    key: string
    label: string
  }>
  title?: string
}

export function ComparisonTable({ items, columns, title }: ComparisonTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      {title && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/80">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Peptide
              </th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b border-slate-100 dark:border-slate-700/50 last:border-0',
                  index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
                )}
              >
                <td className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white">
                  {item.name}
                </td>
                {columns.map(col => (
                  <td
                    key={col.key}
                    className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {item.values[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Efficacy meter
interface EfficacyMeterProps {
  score: number // 0-10
  label: string
  description?: string
}

export function EfficacyMeter({ score, label, description }: EfficacyMeterProps) {
  const percentage = (score / 10) * 100
  const getColor = (score: number) => {
    if (score >= 8) return '#22c55e' // green
    if (score >= 6) return '#3b82f6' // blue
    if (score >= 4) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </span>
        <span
          className="text-lg font-bold"
          style={{ color: getColor(score) }}
        >
          {score}/10
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(score),
          }}
        />
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}

// Stats card grid
interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    change?: {
      value: string
      positive: boolean
    }
    icon?: React.ReactNode
  }>
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {stat.label}
            </span>
            {stat.icon}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </span>
            {stat.change && (
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.change.positive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {stat.change.positive ? '+' : ''}{stat.change.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Timeline for protocols
interface TimelineProps {
  events: Array<{
    week: number | string
    title: string
    description?: string
    status?: 'completed' | 'current' | 'upcoming'
  }>
  title?: string
}

export function Timeline({ events, title }: TimelineProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {title && (
        <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
      )}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Dot */}
              <div
                className={cn(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  event.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  event.status === 'current' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500',
                  event.status === 'upcoming' && 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
                  !event.status && 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                )}
              >
                {typeof event.week === 'number' ? event.week : ''}
              </div>

              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {event.title}
                  </span>
                  {typeof event.week === 'string' && (
                    <span className="text-xs text-slate-500">{event.week}</span>
                  )}
                </div>
                {event.description && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
