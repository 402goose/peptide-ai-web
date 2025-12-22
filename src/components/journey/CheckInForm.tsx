'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Zap, Moon, Smile, Activity, Heart } from 'lucide-react'
import type { LogSymptomsRequest } from '@/types/journey'

interface CheckInFormProps {
  onSubmit: (data: LogSymptomsRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const SIDE_EFFECTS = [
  'Injection site reaction',
  'Fatigue',
  'Headache',
  'Nausea',
  'Dizziness',
  'Muscle pain',
  'Joint pain',
  'Appetite changes',
  'Sleep issues',
  'Mood changes',
]

interface RatingSliderProps {
  label: string
  icon: React.ReactNode
  value: number | undefined
  onChange: (value: number) => void
}

function RatingSlider({ label, icon, value, onChange }: RatingSliderProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="10"
          value={value || 5}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
        />
        <span className={`text-sm font-bold min-w-[2rem] text-center ${
          (value || 5) >= 7 ? 'text-green-600' : (value || 5) >= 4 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {value || 5}
        </span>
      </div>
    </div>
  )
}

export function CheckInForm({ onSubmit, onCancel, loading }: CheckInFormProps) {
  const [formData, setFormData] = useState<Partial<LogSymptomsRequest>>({
    log_date: new Date().toISOString().split('T')[0],
    side_effects: [],
    side_effect_severity: 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await onSubmit({
      log_date: formData.log_date || new Date().toISOString().split('T')[0],
      energy_level: formData.energy_level,
      sleep_quality: formData.sleep_quality,
      mood: formData.mood,
      recovery_feeling: formData.recovery_feeling,
      side_effects: formData.side_effects,
      side_effect_severity: formData.side_effect_severity,
      notes: formData.notes,
    })
  }

  const toggleSideEffect = (effect: string) => {
    const current = formData.side_effects || []
    if (current.includes(effect)) {
      setFormData({
        ...formData,
        side_effects: current.filter((e) => e !== effect),
        side_effect_severity: current.length <= 1 ? 'none' : formData.side_effect_severity,
      })
    } else {
      setFormData({
        ...formData,
        side_effects: [...current, effect],
        side_effect_severity: formData.side_effect_severity === 'none' ? 'mild' : formData.side_effect_severity,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-red-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Daily Check-In</h3>
      </div>

      {/* How are you feeling? */}
      <div className="space-y-4">
        <RatingSlider
          label="Energy Level"
          icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
          value={formData.energy_level}
          onChange={(v) => setFormData({ ...formData, energy_level: v })}
        />

        <RatingSlider
          label="Sleep Quality"
          icon={<Moon className="h-3.5 w-3.5 text-indigo-500" />}
          value={formData.sleep_quality}
          onChange={(v) => setFormData({ ...formData, sleep_quality: v })}
        />

        <RatingSlider
          label="Mood"
          icon={<Smile className="h-3.5 w-3.5 text-green-500" />}
          value={formData.mood}
          onChange={(v) => setFormData({ ...formData, mood: v })}
        />

        <RatingSlider
          label="Recovery Feeling"
          icon={<Activity className="h-3.5 w-3.5 text-blue-500" />}
          value={formData.recovery_feeling}
          onChange={(v) => setFormData({ ...formData, recovery_feeling: v })}
        />
      </div>

      {/* Side effects */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
          Any side effects? (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {SIDE_EFFECTS.map((effect) => (
            <button
              key={effect}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                formData.side_effects?.includes(effect)
                  ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
              }`}
              onClick={() => toggleSideEffect(effect)}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      {(formData.side_effects?.length || 0) > 0 && (
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Side effect severity
          </label>
          <div className="flex gap-2">
            {(['mild', 'moderate', 'severe'] as const).map((severity) => (
              <button
                key={severity}
                type="button"
                className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors capitalize ${
                  formData.side_effect_severity === severity
                    ? severity === 'mild' ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : severity === 'moderate' ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'
                }`}
                onClick={() => setFormData({ ...formData, side_effect_severity: severity })}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes (optional)
        </label>
        <Textarea
          placeholder="How are you feeling today? Any observations..."
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Check-In'}
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
