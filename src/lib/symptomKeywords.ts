/**
 * Symptom keyword detection for connecting chat/journey to symptom products
 */

import type { SymptomCategory } from '@/types/affiliate'
import { CATEGORY_LABELS } from '@/types/affiliate'

// Map common keywords/phrases to symptom categories
export const SYMPTOM_KEYWORDS: Record<string, SymptomCategory> = {
  // Energy & Fatigue
  'tired': 'energy_fatigue',
  'fatigue': 'energy_fatigue',
  'exhausted': 'energy_fatigue',
  'low energy': 'energy_fatigue',
  'no energy': 'energy_fatigue',
  'sluggish': 'energy_fatigue',
  'lethargy': 'energy_fatigue',
  'burnt out': 'energy_fatigue',
  'burnout': 'energy_fatigue',

  // Cognitive
  'brain fog': 'cognitive',
  'focus': 'cognitive',
  'memory': 'cognitive',
  'concentration': 'cognitive',
  'mental clarity': 'cognitive',
  'cognitive': 'cognitive',
  'thinking': 'cognitive',
  'forgetful': 'cognitive',

  // Mood & Mental
  'anxiety': 'mood_mental',
  'anxious': 'mood_mental',
  'depression': 'mood_mental',
  'depressed': 'mood_mental',
  'mood': 'mood_mental',
  'stressed': 'mood_mental',
  'stress': 'mood_mental',
  'irritable': 'mood_mental',
  'emotional': 'mood_mental',

  // Sleep
  'sleep': 'sleep',
  'insomnia': 'sleep',
  'cant sleep': 'sleep',
  "can't sleep": 'sleep',
  'trouble sleeping': 'sleep',
  'restless': 'sleep',
  'wake up': 'sleep',
  'tired in the morning': 'sleep',

  // Gut & Digestive
  'gut': 'gut_digestive',
  'bloating': 'gut_digestive',
  'bloated': 'gut_digestive',
  'digestion': 'gut_digestive',
  'digestive': 'gut_digestive',
  'stomach': 'gut_digestive',
  'ibs': 'gut_digestive',
  'constipation': 'gut_digestive',
  'diarrhea': 'gut_digestive',
  'nausea': 'gut_digestive',

  // Inflammation & Pain
  'joint pain': 'inflammation_pain',
  'inflammation': 'inflammation_pain',
  'inflammatory': 'inflammation_pain',
  'arthritis': 'inflammation_pain',
  'pain': 'inflammation_pain',
  'aching': 'inflammation_pain',
  'sore': 'inflammation_pain',
  'stiff': 'inflammation_pain',
  'stiffness': 'inflammation_pain',
  'swelling': 'inflammation_pain',

  // Recovery
  'recovery': 'recovery',
  'healing': 'recovery',
  'injury': 'recovery',
  'injured': 'recovery',
  'surgery': 'recovery',
  'post-surgery': 'recovery',
  'rehab': 'recovery',
  'muscle recovery': 'recovery',

  // Immune
  'immune': 'immune',
  'immunity': 'immune',
  'sick often': 'immune',
  'getting sick': 'immune',
  'infections': 'immune',
  'cold': 'immune',
  'flu': 'immune',

  // Skin & Hair
  'skin': 'skin_hair',
  'hair': 'skin_hair',
  'hair loss': 'skin_hair',
  'wrinkles': 'skin_hair',
  'aging skin': 'skin_hair',
  'acne': 'skin_hair',

  // Metabolic
  'weight': 'metabolic',
  'metabolism': 'metabolic',
  'metabolic': 'metabolic',
  'blood sugar': 'metabolic',
  'insulin': 'metabolic',

  // Hormonal
  'hormones': 'hormonal_general',
  'hormone': 'hormonal_general',
  'hormonal': 'hormonal_general',
  'testosterone': 'hormonal_male',
  'low t': 'hormonal_male',
  'libido': 'hormonal_general',
  'estrogen': 'hormonal_female',
  'menopause': 'hormonal_female',
  'pms': 'hormonal_female',
  'period': 'hormonal_female',

  // Thyroid
  'thyroid': 'thyroid',
  'hypothyroid': 'thyroid',
  'hyperthyroid': 'thyroid',

  // Cardiovascular
  'heart': 'cardiovascular',
  'cardiovascular': 'cardiovascular',
  'blood pressure': 'cardiovascular',
  'cholesterol': 'cardiovascular',
}

/**
 * Extract symptom categories from text
 * Returns unique categories found in the text
 */
export function extractSymptomCategories(text: string): SymptomCategory[] {
  const lower = text.toLowerCase()
  const found = new Set<SymptomCategory>()

  // Sort keywords by length (longest first) to match multi-word phrases first
  const sortedKeywords = Object.entries(SYMPTOM_KEYWORDS).sort(
    ([a], [b]) => b.length - a.length
  )

  for (const [keyword, category] of sortedKeywords) {
    if (lower.includes(keyword)) {
      found.add(category)
    }
  }

  return Array.from(found)
}

/**
 * Get display label for a category
 */
export function getCategoryLabel(category: SymptomCategory): string {
  return CATEGORY_LABELS[category] || category
}

/**
 * Map journey check-in metrics to symptom categories
 */
export const METRIC_CATEGORY_MAP: Record<string, SymptomCategory> = {
  'energy_level': 'energy_fatigue',
  'sleep_quality': 'sleep',
  'mood': 'mood_mental',
  'pain_level': 'inflammation_pain',
  'recovery_feeling': 'recovery',
}

/**
 * Get symptom categories from low check-in scores
 * Returns categories where score is below threshold (default 5)
 */
export function getCategoriesFromCheckIn(
  checkIn: {
    energy_level?: number
    sleep_quality?: number
    mood?: number
    pain_level?: number
    recovery_feeling?: number
  },
  threshold = 5
): SymptomCategory[] {
  const categories: SymptomCategory[] = []

  if (checkIn.energy_level !== undefined && checkIn.energy_level < threshold) {
    categories.push('energy_fatigue')
  }
  if (checkIn.sleep_quality !== undefined && checkIn.sleep_quality < threshold) {
    categories.push('sleep')
  }
  if (checkIn.mood !== undefined && checkIn.mood < threshold) {
    categories.push('mood_mental')
  }
  // For pain, high score means more pain, so reverse logic
  if (checkIn.pain_level !== undefined && checkIn.pain_level > (10 - threshold)) {
    categories.push('inflammation_pain')
  }
  if (checkIn.recovery_feeling !== undefined && checkIn.recovery_feeling < threshold) {
    categories.push('recovery')
  }

  return categories
}
