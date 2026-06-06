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

const SEARCH_CONTEXT_KEY = 'search-behavior-context'
const MAX_HISTORY_ITEMS = 100
const MAX_RECENT_SEARCHES = 20

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function loadSearchContext(): SearchContext {
  try {
    const data = localStorage.getItem(SEARCH_CONTEXT_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('加载搜索上下文失败:', e)
  }
  return {
    recentSearches: [],
    searchHistory: [],
    viewHistory: [],
    useHistory: [],
    medicineUsageCount: {},
    medicineViewCount: {},
    keywordFrequency: {},
    lastSearchTime: {},
  }
}

export function saveSearchContext(context: SearchContext): void {
  try {
    localStorage.setItem(SEARCH_CONTEXT_KEY, JSON.stringify(context))
  } catch (e) {
    console.error('保存搜索上下文失败:', e)
  }
}

export function recordSearch(keyword: string): SearchContext {
  const context = loadSearchContext()
  
  context.recentSearches = [keyword, ...context.recentSearches.filter(k => k !== keyword)].slice(0, MAX_RECENT_SEARCHES)
  context.keywordFrequency[keyword] = (context.keywordFrequency[keyword] || 0) + 1
  context.lastSearchTime[keyword] = Date.now()
  
  const record: SearchBehaviorRecord = {
    id: generateId(),
    keyword,
    timestamp: Date.now(),
    type: 'search',
  }
  
  context.searchHistory = [record, ...context.searchHistory].slice(0, MAX_HISTORY_ITEMS)
  
  saveSearchContext(context)
  return context
}

export function recordView(
  medicineId: string,
  medicineName: string,
  fromKeyword?: string
): SearchContext {
  const context = loadSearchContext()
  
  context.medicineViewCount[medicineId] = (context.medicineViewCount[medicineId] || 0) + 1
  
  const record: SearchBehaviorRecord = {
    id: generateId(),
    keyword: fromKeyword || '',
    timestamp: Date.now(),
    type: 'view',
    medicineId,
    medicineName,
    fromKeyword,
  }
  
  context.viewHistory = [record, ...context.viewHistory].slice(0, MAX_HISTORY_ITEMS)
  
  saveSearchContext(context)
  return context
}

export function recordUse(
  medicineId: string,
  medicineName: string,
  fromKeyword?: string
): SearchContext {
  const context = loadSearchContext()
  
  context.medicineUsageCount[medicineId] = (context.medicineUsageCount[medicineId] || 0) + 1
  
  const record: SearchBehaviorRecord = {
    id: generateId(),
    keyword: fromKeyword || '',
    timestamp: Date.now(),
    type: 'use',
    medicineId,
    medicineName,
    fromKeyword,
  }
  
  context.useHistory = [record, ...context.useHistory].slice(0, MAX_HISTORY_ITEMS)
  
  saveSearchContext(context)
  return context
}

export function getMedicinePopularityScore(medicineId: string, context: SearchContext): number {
  const usageCount = context.medicineUsageCount[medicineId] || 0
  const viewCount = context.medicineViewCount[medicineId] || 0
  return usageCount * 3 + viewCount * 1
}

export function getRecentUsedMedicines(context: SearchContext, limit: number = 10): string[] {
  const recentUses = context.useHistory
    .filter(r => r.medicineId)
    .slice(0, limit * 2)
  
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const record of recentUses) {
    if (record.medicineId && !seen.has(record.medicineId)) {
      seen.add(record.medicineId)
      result.push(record.medicineId)
      if (result.length >= limit) break
    }
  }
  
  return result
}

export function getRecentViewedMedicines(context: SearchContext, limit: number = 10): string[] {
  const recentViews = context.viewHistory
    .filter(r => r.medicineId)
    .slice(0, limit * 2)
  
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const record of recentViews) {
    if (record.medicineId && !seen.has(record.medicineId)) {
      seen.add(record.medicineId)
      result.push(record.medicineId)
      if (result.length >= limit) break
    }
  }
  
  return result
}

export function getRelatedKeywords(keyword: string, context: SearchContext, limit: number = 5): string[] {
  const relatedRecords = [
    ...context.searchHistory.filter(r => r.keyword.includes(keyword)),
    ...context.viewHistory.filter(r => r.fromKeyword === keyword),
    ...context.useHistory.filter(r => r.fromKeyword === keyword),
  ]
  
  const relatedKeywords = new Set<string>()
  
  relatedRecords.forEach(record => {
    if (record.medicineName && record.medicineName !== keyword) {
      relatedKeywords.add(record.medicineName)
    }
  })
  
  context.searchHistory.forEach(record => {
    if (record.keyword !== keyword && 
        (record.keyword.includes(keyword) || keyword.includes(record.keyword))) {
      relatedKeywords.add(record.keyword)
    }
  })
  
  return Array.from(relatedKeywords).slice(0, limit)
}

export function clearSearchHistory(): void {
  const context = loadSearchContext()
  context.recentSearches = []
  context.searchHistory = []
  saveSearchContext(context)
}

export function clearAllSearchData(): void {
  localStorage.removeItem(SEARCH_CONTEXT_KEY)
}

export function getSearchChain(medicineId: string): SearchBehaviorRecord[] {
  const context = loadSearchContext()
  const chain: SearchBehaviorRecord[] = []
  
  const useRecord = context.useHistory.find(r => r.medicineId === medicineId)
  if (useRecord && useRecord.fromKeyword) {
    const searchRecord = context.searchHistory.find(r => r.keyword === useRecord.fromKeyword)
    if (searchRecord) {
      chain.push(searchRecord)
    }
    
    const viewRecord = context.viewHistory.find(
      r => r.medicineId === medicineId && r.fromKeyword === useRecord.fromKeyword
    )
    if (viewRecord) {
      chain.push(viewRecord)
    }
    
    chain.push(useRecord)
  }
  
  return chain
}
