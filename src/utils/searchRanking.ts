import type { Medicine } from '@/types/medicine'
import { getPinyinInitial } from './pinyin'
import { fuzzyMatch, correctTypo, getSemanticKeywords, expandSearchTerms } from './fuzzyMatch'
import type { SearchContext } from './searchBehavior'
import { getMedicinePopularityScore, getRecentUsedMedicines, getRecentViewedMedicines } from './searchBehavior'
import { calculateExpiryStatus, getDaysUntilExpiry } from './date'

export type SortDimension = 'relevance' | 'popularity' | 'expiry' | 'recent'

export interface SearchMatchResult {
  medicine: Medicine
  score: number
  matchFields: string[]
  matchReasons: string[]
  correctedKeyword?: string
  isExpired: boolean
  daysUntilExpiry: number
}

export interface RankOptions {
  keyword: string
  sortDimension: SortDimension
  context: SearchContext
}

export function calculateMatchScore(
  medicine: Medicine,
  keyword: string,
  context: SearchContext
): SearchMatchResult {
  let score = 0
  const matchFields: string[] = []
  const matchReasons: string[] = []
  
  const expandedTerms = expandSearchTerms(keyword)
  const correctedKeyword = expandedTerms.corrected
  const allSearchTerms = [
    keyword,
    correctedKeyword,
    ...expandedTerms.synonyms,
    ...expandedTerms.semantic,
  ].filter(Boolean)
  
  const keywordLower = keyword.toLowerCase()
  const keywordPinyin = getPinyinInitial(keyword).toLowerCase()
  const nameLower = medicine.name.toLowerCase()
  const namePinyin = getPinyinInitial(medicine.name).toLowerCase()
  const symptomsLower = medicine.symptoms.toLowerCase()
  const symptomsPinyin = getPinyinInitial(medicine.symptoms).toLowerCase()
  const manufacturerLower = medicine.manufacturer.toLowerCase()
  
  if (nameLower === keywordLower) {
    score += 100
    matchFields.push('name-exact')
    matchReasons.push('名称精确匹配')
  } else if (nameLower.includes(keywordLower)) {
    score += 50
    matchFields.push('name-include')
    matchReasons.push('名称包含关键词')
  } else if (namePinyin.includes(keywordPinyin) && keywordPinyin.length > 0) {
    score += 35
    matchFields.push('name-pinyin')
    matchReasons.push(`拼音匹配「${keywordPinyin}」`)
  } else if (fuzzyMatch(keywordLower, nameLower, 2)) {
    score += 25
    matchFields.push('name-fuzzy')
    matchReasons.push(`名称模糊匹配${correctedKeyword !== keyword ? `（已纠正为「${correctedKeyword}」）` : ''}`)
  }
  
  for (const term of allSearchTerms) {
    if (!term || term === keyword) continue
    const termLower = term.toLowerCase()
    if (nameLower.includes(termLower) || fuzzyMatch(termLower, nameLower, 1)) {
      score += 15
      if (!matchFields.includes('name-semantic')) {
        matchFields.push('name-semantic')
        matchReasons.push(`语义匹配「${term}」`)
      }
    }
  }
  
  const semanticKeywords = getSemanticKeywords(keyword)
  if (semanticKeywords.length > 0) {
    for (const sk of semanticKeywords) {
      if (symptomsLower.includes(sk.toLowerCase()) || fuzzyMatch(sk, medicine.symptoms, 1)) {
        score += 40
        matchFields.push('symptoms-semantic')
        matchReasons.push(`症状匹配「${sk}」`)
        break
      }
    }
  }
  
  if (symptomsLower.includes(keywordLower)) {
    score += 30
    matchFields.push('symptoms-include')
    matchReasons.push('症状包含关键词')
  } else if (symptomsPinyin.includes(keywordPinyin) && keywordPinyin.length > 0) {
    score += 20
    matchFields.push('symptoms-pinyin')
    matchReasons.push('症状拼音匹配')
  } else if (fuzzyMatch(keywordLower, symptomsLower, 2)) {
    score += 15
    matchFields.push('symptoms-fuzzy')
    matchReasons.push('症状模糊匹配')
  }
  
  if (manufacturerLower.includes(keywordLower)) {
    score += 20
    matchFields.push('manufacturer-include')
    matchReasons.push('厂家包含关键词')
  } else if (fuzzyMatch(keywordLower, manufacturerLower, 2)) {
    score += 10
    matchFields.push('manufacturer-fuzzy')
    matchReasons.push('厂家模糊匹配')
  }
  
  for (const term of allSearchTerms) {
    if (!term || term === keyword) continue
    const termLower = term.toLowerCase()
    if (symptomsLower.includes(termLower)) {
      score += 20
      if (!matchFields.includes('symptoms-semantic')) {
        matchFields.push('symptoms-semantic')
        matchReasons.push(`症状语义匹配「${term}」`)
      }
    }
  }
  
  const popularityScore = getMedicinePopularityScore(medicine.id, context)
  if (popularityScore > 0) {
    score += Math.min(popularityScore * 2, 30)
    matchReasons.push(`常用度加成（${popularityScore}次使用/浏览）`)
  }
  
  const { status } = calculateExpiryStatus(medicine.expiryDate)
  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate)
  const isExpired = status === 'expired'
  
  if (status === 'expired') {
    score -= 50
    matchReasons.push('已过期')
  } else if (status === 'warning') {
    score -= 10
  } else if (daysUntilExpiry > 365) {
    score += 10
    matchReasons.push('有效期充足')
  }
  
  const recentUsed = getRecentUsedMedicines(context, 20)
  const recentViewed = getRecentViewedMedicines(context, 20)
  
  if (recentUsed.includes(medicine.id)) {
    score += 25
    matchReasons.push('近期使用过')
  } else if (recentViewed.includes(medicine.id)) {
    score += 15
    matchReasons.push('近期浏览过')
  }
  
  return {
    medicine,
    score,
    matchFields,
    matchReasons,
    correctedKeyword: correctedKeyword !== keyword ? correctedKeyword : undefined,
    isExpired,
    daysUntilExpiry,
  }
}

export function rankResults(
  results: SearchMatchResult[],
  sortDimension: SortDimension
): SearchMatchResult[] {
  return [...results].sort((a, b) => {
    switch (sortDimension) {
      case 'relevance':
        if (b.score !== a.score) return b.score - a.score
        return b.daysUntilExpiry - a.daysUntilExpiry
        
      case 'popularity':
        if (b.isExpired && !a.isExpired) return -1
        if (!b.isExpired && a.isExpired) return 1
        return b.score - a.score
        
      case 'expiry':
        if (b.isExpired && !a.isExpired) return -1
        if (!b.isExpired && a.isExpired) return 1
        return b.daysUntilExpiry - a.daysUntilExpiry
        
      case 'recent':
        return b.medicine.updatedAt.localeCompare(a.medicine.updatedAt)
        
      default:
        return b.score - a.score
    }
  })
}

export function getSortDimensionLabel(dimension: SortDimension): string {
  const labels: Record<SortDimension, string> = {
    relevance: '智能排序',
    popularity: '常用优先',
    expiry: '效期优先',
    recent: '最近添加',
  }
  return labels[dimension]
}

export function getSortDimensionIcon(dimension: SortDimension): string {
  const icons: Record<SortDimension, string> = {
    relevance: 'TrendCharts',
    popularity: 'Star',
    expiry: 'Clock',
    recent: 'Clock',
  }
  return icons[dimension]
}
