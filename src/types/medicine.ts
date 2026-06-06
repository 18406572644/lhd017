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
  familyMember?: string
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
  purchasePrice?: number
  purchaseDate?: string
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

export const FAMILY_MEMBERS = [
  { value: 'father', label: '父亲', color: '#3b82f6' },
  { value: 'mother', label: '母亲', color: '#ec4899' },
  { value: 'grandpa', label: '爷爷', color: '#f97316' },
  { value: 'grandma', label: '奶奶', color: '#8b5cf6' },
  { value: 'son', label: '儿子', color: '#10b981' },
  { value: 'daughter', label: '女儿', color: '#f59e0b' },
  { value: 'other', label: '其他', color: '#6b7280' },
] as const

export type FamilyMember = typeof FAMILY_MEMBERS[number]['value']

export interface ChartExportOptions {
  title: string
  format: 'png' | 'jpeg'
  quality: number
}

export interface UsageTrendData {
  date: string
  count: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface ExpiryForecastData {
  period: string
  count: number
}

export interface MonthlyCostData {
  month: string
  cost: number
}

export interface FamilyUsageData {
  member: string
  count: number
  color: string
}

export type InteractionRiskLevel = 'safe' | 'caution' | 'danger'

export const INTERACTION_RISK_INFO: Record<
  InteractionRiskLevel,
  { label: string; icon: string; bgColor: string; color: string; borderColor: string }
> = {
  safe: { label: '安全', icon: '🟢', bgColor: '#ecfdf5', color: '#059669', borderColor: '#10b981' },
  caution: { label: '慎用', icon: '🟡', bgColor: '#fffbeb', color: '#d97706', borderColor: '#f59e0b' },
  danger: { label: '禁用', icon: '🔴', bgColor: '#fef2f2', color: '#dc2626', borderColor: '#ef4444' },
}

export type InteractionType = 'drug-drug' | 'drug-herb' | 'drug-food'

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  'drug-drug': '西药-西药',
  'drug-herb': '西药-中药',
  'drug-food': '药品-食物',
}

export interface DrugInteraction {
  id: string
  drugAName: string
  drugAAliases: string[]
  drugBName: string
  drugBAliases: string[]
  type: InteractionType
  riskLevel: InteractionRiskLevel
  mechanism: string
  symptoms: string[]
  suggestions: string[]
  references?: string
}

export type SpecialPeriodType =
  | 'pregnancy'
  | 'pre-pregnancy'
  | 'lactation'
  | 'liver-dysfunction'
  | 'kidney-dysfunction'
  | 'elderly'
  | 'child'

export const SPECIAL_PERIOD_INFO: Record<
  SpecialPeriodType,
  { label: string; icon: string; description: string; color: string }
> = {
  pregnancy: { label: '怀孕期间', icon: '🤰', description: '已怀孕，需特别注意用药安全', color: '#ec4899' },
  'pre-pregnancy': { label: '备孕期', icon: '💑', description: '正在备孕中', color: '#f472b6' },
  lactation: { label: '哺乳期', icon: '🍼', description: '正在哺乳', color: '#fb923c' },
  'liver-dysfunction': { label: '肝功能不全', icon: '🫀', description: '肝功能异常', color: '#eab308' },
  'kidney-dysfunction': { label: '肾功能不全', icon: '🫘', description: '肾功能异常', color: '#8b5cf6' },
  elderly: { label: '老年人', icon: '👴', description: '65岁以上老年人', color: '#6b7280' },
  child: { label: '儿童', icon: '👶', description: '12岁以下儿童', color: '#06b6d4' },
}

export interface Contraindication {
  id: string
  drugName: string
  drugAliases: string[]
  specialPeriod: SpecialPeriodType
  riskLevel: InteractionRiskLevel
  mechanism: string
  symptoms: string[]
  suggestions: string[]
  alternativeDrugs?: string[]
}

export interface InteractionCheckResult {
  drugName: string
  interactingDrugName: string
  type: InteractionType
  riskLevel: InteractionRiskLevel
  mechanism: string
  symptoms: string[]
  suggestions: string[]
  interactionDate?: string
}

export interface ContraindicationCheckResult {
  drugName: string
  specialPeriod: SpecialPeriodType
  riskLevel: InteractionRiskLevel
  mechanism: string
  symptoms: string[]
  suggestions: string[]
  alternativeDrugs?: string[]
}

export interface ComprehensiveCheckResult {
  overallRisk: InteractionRiskLevel
  interactionResults: InteractionCheckResult[]
  contraindicationResults: ContraindicationCheckResult[]
  safeDrugs: string[]
  checkedDate: string
}

export interface UserHealthProfile {
  id: string
  familyMember: FamilyMember
  specialPeriods: SpecialPeriodType[]
  allergies: string[]
  chronicDiseases: string[]
  createdAt: string
  updatedAt: string
}

export interface CheckHistory {
  id: string
  checkedDrugs: string[]
  result: ComprehensiveCheckResult
  createdAt: string
  familyMember?: string
}

export type SortDimension = 'relevance' | 'popularity' | 'expiry' | 'recent'

export interface SearchSuggestion {
  text: string
  type: 'medicine' | 'symptom' | 'category' | 'history'
  highlight?: string
  pinyinInitial?: string
}

export interface SearchMatchResult {
  medicine: Medicine
  score: number
  matchFields: string[]
  matchReasons: string[]
  correctedKeyword?: string
  isExpired: boolean
  daysUntilExpiry: number
}

export interface SearchBehaviorRecord {
  id: string
  keyword: string
  timestamp: number
  type: 'search' | 'view' | 'use'
  medicineId?: string
  medicineName?: string
  duration?: number
  fromKeyword?: string
}

export interface SearchContext {
  recentSearches: string[]
  searchHistory: SearchBehaviorRecord[]
  viewHistory: SearchBehaviorRecord[]
  useHistory: SearchBehaviorRecord[]
  medicineUsageCount: Record<string, number>
  medicineViewCount: Record<string, number>
  keywordFrequency: Record<string, number>
  lastSearchTime: Record<string, number>
}

export interface SearchFilterOptions extends FilterOptions {
  sortDimension: SortDimension
}

export const SORT_DIMENSION_OPTIONS: Array<{
  value: SortDimension
  label: string
  icon: string
}> = [
  { value: 'relevance', label: '智能排序', icon: 'TrendCharts' },
  { value: 'popularity', label: '常用优先', icon: 'Star' },
  { value: 'expiry', label: '效期优先', icon: 'Clock' },
  { value: 'recent', label: '最近添加', icon: 'Clock' },
]

export const SEARCH_SUGGESTION_TYPE_LABELS: Record<SearchSuggestion['type'], string> = {
  medicine: '药品',
  symptom: '症状',
  category: '分类',
  history: '历史',
}

export const SEARCH_SUGGESTION_TYPE_COLORS: Record<SearchSuggestion['type'], string> = {
  medicine: '#3b82f6',
  symptom: '#f59e0b',
  category: '#10b981',
  history: '#6b7280',
}
