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

export type ExportFormat = 'json' | 'csv'

export type ExportScope = 'all' | 'filtered'

export interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  includeTags: boolean
  includeUsageRecords: boolean
}

export interface Statistics {
  total: number
  warning: number
  expired: number
  categories: Record<MedicineCategory, number>
}

export interface CategoryInfo {
  value: MedicineCategory
  label: string
  icon: string
  color: string
}

export const CATEGORY_LIST: CategoryInfo[] = [
  { value: 'cold', label: '感冒药', icon: 'ColdDrink', color: '#4A90D9' },
  { value: 'fever', label: '退烧药', icon: 'HotWater', color: '#EF5350' },
  { value: 'stomach', label: '肠胃药', icon: 'Goblet', color: '#FFB74D' },
  { value: 'antibiotic', label: '抗生素', icon: 'DataAnalysis', color: '#AB47BC' },
  { value: 'external', label: '外用药', icon: 'FirstAidKit', color: '#66BB6A' },
  { value: 'chronic', label: '慢性病用药', icon: 'Cherry', color: '#EC407A' },
  { value: 'health', label: '保健品', icon: 'Apple', color: '#8BC34A' },
  { value: 'other', label: '其他', icon: 'Box', color: '#78909C' },
]

export const EXPIRY_STATUS_INFO = {
  normal: { label: '正常', color: '#8BC34A', bgColor: '#E8F5E9' },
  warning: { label: '即将过期', color: '#FFB74D', bgColor: '#FFF3E0' },
  expired: { label: '已过期', color: '#EF5350', bgColor: '#FFEBEE' },
}

export interface SymptomMatch {
  symptom: string
  matchedKeywords: string[]
  matchScore: number
}

export interface MedicineRecommendation {
  medicine: Medicine
  matchScore: number
  matchedSymptoms: SymptomMatch[]
  warnings: string[]
  isExpired: boolean
}

export interface UsageRecord {
  id: string
  medicineId: string
  medicineName: string
  symptoms: string
  usageDate: string
  dosage: string
  effect: 'excellent' | 'good' | 'average' | 'poor'
  sideEffects: string
  notes: string
  createdAt: string
}

export interface SymptomKnowledge {
  symptom: string
  keywords: string[]
  relatedSymptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  warning: string
  suggestions: string[]
}

export const EFFECT_OPTIONS = [
  { value: 'excellent', label: '效果很好', color: '#8BC34A' },
  { value: 'good', label: '效果不错', color: '#4A90D9' },
  { value: 'average', label: '效果一般', color: '#FFB74D' },
  { value: 'poor', label: '效果较差', color: '#EF5350' },
]

export const SEVERITY_INFO = {
  mild: { label: '轻度', color: '#8BC34A', bgColor: '#E8F5E9' },
  moderate: { label: '中度', color: '#FFB74D', bgColor: '#FFF3E0' },
  severe: { label: '重度', color: '#EF5350', bgColor: '#FFEBEE' },
}
