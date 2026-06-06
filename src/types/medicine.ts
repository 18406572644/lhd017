export type MedicineCategory =
  | 'cold'
  | 'fever'
  | 'stomach'
  | 'antibiotic'
  | 'external'
  | 'chronic'
  | 'health'
  | 'other'

export type ExpiryStatus = 'normal' | 'warning' | 'expired'

export interface MedicineTag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface UsageRecord {
  id: string
  medicineId: string
  medicineName: string
  usage?: string
  date?: string
  quantity?: number
  notes?: string
  createdAt: string
  usageDate?: string
  symptoms?: string
  dosage?: string
  effect?: EffectLevel
  sideEffects?: string
}

export interface SymptomMatch {
  symptom: string
  matchedKeywords: string[]
  matchScore: number
}

export interface SymptomKnowledge {
  symptom: string
  keywords: string[]
  relatedSymptoms: string[]
  severity: SymptomSeverity
  warning: string
  suggestions: string[]
}

export interface ExportOptions {
  format: 'json' | 'csv'
  scope: 'all' | 'filtered'
  includeTags: boolean
  includeUsageRecords: boolean
}

export interface MedicineRecommendation {
  medicine: Medicine
  matchScore: number
  matchReasons?: string[]
  isExpired: boolean
  matchedSymptoms?: SymptomMatch[]
  warnings?: string[]
}

export interface Medicine {
  id: string
  name: string
  category: MedicineCategory
  specification: string
  manufacturer: string
  productionDate: string
  expiryDate: string
  quantity: number
  storageLocation: string
  symptoms: string
  usage: string
  notes: string
  image: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export interface FilterOptions {
  keyword: string
  category: MedicineCategory | ''
  expiryStatus: ExpiryStatus | ''
  tagIds: string[]
}

export interface Statistics {
  total: number
  warning: number
  expired: number
  categories: Record<MedicineCategory, number>
}

export const MEDICINE_CATEGORY_LABELS: Record<MedicineCategory, string> = {
  cold: '感冒发烧',
  fever: '解热镇痛',
  stomach: '肠胃用药',
  antibiotic: '抗生素',
  external: '外用药品',
  chronic: '慢性病用药',
  health: '保健用品',
  other: '其他',
}

export const CATEGORY_LIST: Array<{
  value: MedicineCategory
  label: string
  color: string
  icon: string
}> = [
  { value: 'cold', label: '感冒发烧', color: '#3b82f6', icon: 'ColdDrink' },
  { value: 'fever', label: '解热镇痛', color: '#f59e0b', icon: 'HotWater' },
  { value: 'stomach', label: '肠胃用药', color: '#10b981', icon: 'Goblet' },
  { value: 'antibiotic', label: '抗生素', color: '#ef4444', icon: 'DataAnalysis' },
  { value: 'external', label: '外用药品', color: '#8b5cf6', icon: 'FirstAidKit' },
  { value: 'chronic', label: '慢性病用药', color: '#f97316', icon: 'Cherry' },
  { value: 'health', label: '保健用品', color: '#22c55e', icon: 'Apple' },
  { value: 'other', label: '其他', color: '#6b7280', icon: 'Box' },
]

export type SymptomSeverity = 'mild' | 'moderate' | 'severe'
export type EffectLevel = 'excellent' | 'good' | 'average' | 'poor'

export const SEVERITY_INFO: Record<
  SymptomSeverity,
  { label: string; bgColor: string; color: string }
> = {
  mild: { label: '轻度', bgColor: '#ecfdf5', color: '#059669' },
  moderate: { label: '中度', bgColor: '#fffbeb', color: '#d97706' },
  severe: { label: '重度', bgColor: '#fef2f2', color: '#dc2626' },
}

export const EFFECT_OPTIONS: Array<{
  value: EffectLevel
  label: string
  color: string
}> = [
  { value: 'excellent', label: '效果很好', color: '#10b981' },
  { value: 'good', label: '效果较好', color: '#3b82f6' },
  { value: 'average', label: '效果一般', color: '#f59e0b' },
  { value: 'poor', label: '效果不佳', color: '#ef4444' },
]

export const EXPIRY_STATUS_INFO: Record<
  ExpiryStatus,
  { label: string; type: 'success' | 'warning' | 'danger'; bgColor: string; color: string }
> = {
  normal: { label: '正常', type: 'success', bgColor: '#ecfdf5', color: '#059669' },
  warning: { label: '即将过期', type: 'warning', bgColor: '#fffbeb', color: '#d97706' },
  expired: { label: '已过期', type: 'danger', bgColor: '#fef2f2', color: '#dc2626' },
}
