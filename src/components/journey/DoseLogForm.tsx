'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Syringe, Clock, MapPin, Calendar } from 'lucide-react'
import { MiniCalculator } from '@/components/tools/MiniCalculator'
import type { LogDoseRequest, AdministrationRoute } from '@/types/journey'

interface DoseLogFormProps {
  peptide: string
  onSubmit: (data: LogDoseRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  // For editing existing dose
  initialData?: {
    dose_amount?: number
    dose_unit?: string
    route?: AdministrationRoute
    injection_site?: string
    time_of_day?: string
    fasted?: boolean
    notes?: string
    log_date?: string
  }
}

const ROUTES: { value: AdministrationRoute; label: string }[] = [
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'oral', label: 'Oral' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'topical', label: 'Topical' },
]

const INJECTION_SITES = [
  'Abdomen',
  'Thigh',
  'Deltoid',
  'Glute',
  'Other',
]

const TIME_OF_DAY = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'pre_workout', label: 'Pre-Workout' },
  { value: 'post_workout', label: 'Post-Workout' },
  { value: 'before_bed', label: 'Before Bed' },
]

export function DoseLogForm({ peptide, onSubmit, onCancel, loading, initialData }: DoseLogFormProps) {
  // Get today's date in local timezone for default
  const getLocalDate = () => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<Partial<LogDoseRequest> & { log_date?: string }>({
    peptide,
    dose_amount: initialData?.dose_amount ?? undefined,
    dose_unit: initialData?.dose_unit ?? 'mcg',
    route: initialData?.route ?? 'subcutaneous',
    injection_site: initialData?.injection_site,
    time_of_day: initialData?.time_of_day,
    fasted: initialData?.fasted,
    notes: initialData?.notes,
    log_date: initialData?.log_date ?? getLocalDate(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dose_amount) return

    await onSubmit({
      peptide: formData.peptide || peptide,
      dose_amount: formData.dose_amount,
      dose_unit: formData.dose_unit || 'mcg',
      route: formData.route,
      injection_site: formData.injection_site,
      time_of_day: formData.time_of_day,
      fasted: formData.fasted,
      notes: formData.notes,
    })
  }

  const handleDoseFromCalculator = (dose: number, units: number) => {
    setFormData({ ...formData, dose_amount: dose, dose_unit: 'mcg' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Syringe className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {initialData ? 'Edit Dose' : 'Log Dose'}
        </h3>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          <Calendar className="inline h-3.5 w-3.5 mr-1" />
          Date
        </label>
        <Input
          type="date"
          value={formData.log_date || ''}
          onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
          max={getLocalDate()}
          className="w-full"
        />
      </div>

      {/* Mini Calculator */}
      <MiniCalculator
        peptideName={peptide}
        onDoseCalculated={handleDoseFromCalculator}
      />

      {/* Dose amount and unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="250"
            value={formData.dose_amount || ''}
            onChange={(e) => setFormData({ ...formData, dose_amount: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Unit
          </label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={formData.dose_unit}
            onChange={(e) => setFormData({ ...formData, dose_unit: e.target.value })}
          >
            <option value="mcg">mcg</option>
            <option value="mg">mg</option>
            <option value="IU">IU</option>
            <option value="ml">ml</option>
          </select>
        </div>
      </div>

      {/* Route */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          <MapPin className="inline h-3.5 w-3.5 mr-1" />
          Route
        </label>
        <div className="flex flex-wrap gap-2">
          {ROUTES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                formData.route === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
              }`}
              onClick={() => setFormData({ ...formData, route: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Injection site (if applicable) */}
      {(formData.route === 'subcutaneous' || formData.route === 'intramuscular') && (
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Injection Site
          </label>
          <div className="flex flex-wrap gap-2">
            {INJECTION_SITES.map((site) => (
              <button
                key={site}
                type="button"
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  formData.injection_site === site
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => setFormData({ ...formData, injection_site: site })}
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time of day */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          <Clock className="inline h-3.5 w-3.5 mr-1" />
          Time of Day
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OF_DAY.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                formData.time_of_day === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
              }`}
              onClick={() => setFormData({ ...formData, time_of_day: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Fasted */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="fasted"
          checked={formData.fasted || false}
          onChange={(e) => setFormData({ ...formData, fasted: e.target.checked })}
          className="rounded border-slate-300"
        />
        <label htmlFor="fasted" className="text-sm text-slate-700 dark:text-slate-300">
          Taken in fasted state
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes (optional)
        </label>
        <Textarea
          placeholder="Any observations or notes..."
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !formData.dose_amount}>
          {loading ? 'Logging...' : 'Log Dose'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
