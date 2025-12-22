// Journey types matching backend

export type JourneyStatus = 'planning' | 'active' | 'paused' | 'completed' | 'discontinued'

export type GoalCategory =
  | 'muscle_growth'
  | 'fat_loss'
  | 'recovery'
  | 'healing'
  | 'anti_aging'
  | 'cognitive'
  | 'sleep'
  | 'energy'
  | 'libido'
  | 'immune'
  | 'other'

export type AdministrationRoute =
  | 'subcutaneous'
  | 'intramuscular'
  | 'oral'
  | 'nasal'
  | 'topical'

export interface Goal {
  id: string
  category: GoalCategory
  description: string
  target_metric?: string
  baseline_value?: string
  target_value?: string
}

export interface JourneySummary {
  journey_id: string
  title: string
  primary_peptide: string
  status: JourneyStatus
  start_date?: string
  dose_count: number
  overall_efficacy_rating?: number
  created_at: string
}

export interface DoseLog {
  log_id: string
  timestamp: string
  peptide: string
  dose_amount: number
  dose_unit: string
  route: AdministrationRoute
  injection_site?: string
  time_of_day?: string
  fasted?: boolean
  notes?: string
}

export interface SymptomLog {
  log_id: string
  log_date: string
  energy_level?: number
  sleep_quality?: number
  mood?: number
  pain_level?: number
  recovery_feeling?: number
  goal_progress?: Record<string, number>
  side_effects: string[]
  side_effect_severity: 'none' | 'mild' | 'moderate' | 'severe'
  weight_kg?: number
  body_fat_percent?: number
  notes?: string
}

export interface Milestone {
  milestone_id: string
  timestamp: string
  milestone_type: 'improvement' | 'setback' | 'side_effect' | 'adjustment'
  title: string
  description: string
  related_goal_id?: string
  is_shareable: boolean
  media_urls: string[]
}

export interface JourneyDetail extends JourneySummary {
  secondary_peptides: string[]
  goals: Goal[]
  planned_protocol?: string
  planned_duration_weeks?: number
  administration_route: AdministrationRoute
  dose_logs?: DoseLog[]
  symptom_logs?: SymptomLog[]
  milestones?: Milestone[]
  notes?: Array<{
    note_id: string
    content: string
    note_type: string
    created_at: string
  }>
  outcomes?: {
    overall_efficacy_rating: number
    would_recommend: boolean
    would_use_again: boolean
    outcome_summary?: string
    what_worked?: string
    what_didnt_work?: string
    advice_for_others?: string
  }
}

// API request types
export interface CreateJourneyRequest {
  title?: string
  primary_peptide: string
  secondary_peptides?: string[]
  goals: Array<Omit<Goal, 'id'>>
  planned_protocol?: string
  planned_duration_weeks?: number
  administration_route?: AdministrationRoute
}

export interface LogDoseRequest {
  peptide: string
  dose_amount: number
  dose_unit: string
  route?: AdministrationRoute
  injection_site?: string
  time_of_day?: string
  fasted?: boolean
  notes?: string
}

export interface LogSymptomsRequest {
  log_date: string
  energy_level?: number
  sleep_quality?: number
  mood?: number
  pain_level?: number
  recovery_feeling?: number
  goal_progress?: Record<string, number>
  side_effects?: string[]
  side_effect_severity?: 'none' | 'mild' | 'moderate' | 'severe'
  weight_kg?: number
  body_fat_percent?: number
  notes?: string
}
