// Affiliate & Holistic Products Types

export type ProductType =
  | 'peptide'
  | 'supplement'
  | 'herb'
  | 'amino_acid'
  | 'vitamin'
  | 'mineral'
  | 'adaptogen'
  | 'probiotic'
  | 'enzyme'
  | 'hormone'
  | 'other'

export type SymptomCategory =
  | 'energy_fatigue'
  | 'cognitive'
  | 'mood_mental'
  | 'sleep'
  | 'gut_digestive'
  | 'hormonal_female'
  | 'hormonal_male'
  | 'hormonal_general'
  | 'thyroid'
  | 'metabolic'
  | 'immune'
  | 'inflammation_pain'
  | 'liver_detox'
  | 'cardiovascular'
  | 'kidney_fluid'
  | 'skin_hair'
  | 'neurological'
  | 'recovery'
  | 'appetite_cravings'
  | 'urinary_reproductive'
  | 'temperature'

export interface HolisticProduct {
  product_id: string
  name: string
  product_type: ProductType
  description?: string
  affiliate_url?: string
  affiliate_code?: string
  vendor?: string
  is_peptide: boolean
  requires_prescription?: boolean
  typical_dose?: string
  typical_frequency?: string
}

export interface LabTest {
  test_id: string
  name: string
  description?: string
  affiliate_url?: string
  vendor?: string
  typical_cost_range?: string
  requires_fasting?: boolean
  at_home_available?: boolean
}

export interface Symptom {
  symptom_id: string
  name: string
  slug: string
  category: SymptomCategory
  description?: string
  recommended_products: string[]
  recommended_labs: string[]
  keywords: string[]
}

export interface SymptomWithProducts extends Symptom {
  products: HolisticProduct[]
  labs: LabTest[]
}

export interface CategoryCount {
  category: SymptomCategory
  count: number
}

export interface SearchResult {
  query: string
  symptoms: Symptom[]
  products: HolisticProduct[]
}

export interface AffiliateClickData {
  product_id: string
  symptom_id?: string
  source: 'journey' | 'chat' | 'stacks' | 'search' | 'symptom_page'
  source_id?: string
}

// Category display names and colors
export const CATEGORY_LABELS: Record<SymptomCategory, string> = {
  energy_fatigue: 'Energy & Fatigue',
  cognitive: 'Cognitive',
  mood_mental: 'Mood & Mental',
  sleep: 'Sleep',
  gut_digestive: 'Gut & Digestive',
  hormonal_female: 'Female Hormones',
  hormonal_male: 'Male Hormones',
  hormonal_general: 'Hormonal',
  thyroid: 'Thyroid',
  metabolic: 'Metabolic',
  immune: 'Immune',
  inflammation_pain: 'Inflammation & Pain',
  liver_detox: 'Liver & Detox',
  cardiovascular: 'Heart & Blood',
  kidney_fluid: 'Kidney & Fluid',
  skin_hair: 'Skin & Hair',
  neurological: 'Neurological',
  recovery: 'Recovery',
  appetite_cravings: 'Appetite & Cravings',
  urinary_reproductive: 'Urinary & Reproductive',
  temperature: 'Temperature',
}

export const CATEGORY_COLORS: Record<SymptomCategory, string> = {
  energy_fatigue: '#f59e0b',      // Amber
  cognitive: '#8b5cf6',           // Purple
  mood_mental: '#ec4899',         // Pink
  sleep: '#6366f1',               // Indigo
  gut_digestive: '#10b981',       // Emerald
  hormonal_female: '#f472b6',     // Pink
  hormonal_male: '#3b82f6',       // Blue
  hormonal_general: '#a855f7',    // Purple
  thyroid: '#14b8a6',             // Teal
  metabolic: '#f97316',           // Orange
  immune: '#22c55e',              // Green
  inflammation_pain: '#ef4444',   // Red
  liver_detox: '#84cc16',         // Lime
  cardiovascular: '#dc2626',      // Red
  kidney_fluid: '#0ea5e9',        // Sky
  skin_hair: '#d946ef',           // Fuchsia
  neurological: '#7c3aed',        // Violet
  recovery: '#06b6d4',            // Cyan
  appetite_cravings: '#eab308',   // Yellow
  urinary_reproductive: '#be185d', // Pink
  temperature: '#fb923c',         // Orange
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  peptide: 'Peptide',
  supplement: 'Supplement',
  herb: 'Herb',
  amino_acid: 'Amino Acid',
  vitamin: 'Vitamin',
  mineral: 'Mineral',
  adaptogen: 'Adaptogen',
  probiotic: 'Probiotic',
  enzyme: 'Enzyme',
  hormone: 'Hormone',
  other: 'Other',
}
