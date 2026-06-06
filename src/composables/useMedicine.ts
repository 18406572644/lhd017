import { ref, computed, onMounted } from 'vue'
import type { 
  Medicine, 
  MedicineCategory, 
  FilterOptions, 
  Statistics,
  SortDimension,
  SearchMatchResult,
  SearchSuggestion,
  SearchContext,
} from '@/types/medicine'
import { calculateExpiryStatus, generateId, getTodayString } from '@/utils/date'
import { getMedicineList, saveMedicineList, getUsageRecords } from '@/utils/storage'
import { mockMedicineList } from '@/data/mockData'
import { calculateMatchScore, rankResults } from '@/utils/searchRanking'
import { generateSuggestions, getHotSearchTerms } from '@/utils/searchSuggestion'
import { 
  loadSearchContext, 
  recordSearch, 
  recordView, 
  recordUse,
  clearSearchHistory,
  clearAllSearchData,
} from '@/utils/searchBehavior'
import { correctTypo, expandSearchTerms } from '@/utils/fuzzyMatch'

export function useMedicine() {
  const medicineList = ref<Medicine[]>([])
  const searchContext = ref<SearchContext>(loadSearchContext())
  const sortDimension = ref<SortDimension>('relevance')
  const searchSuggestions = ref<SearchSuggestion[]>([])
  const showSuggestions = ref(false)
  const lastSearchKeyword = ref('')
  const correctedKeyword = ref<string | undefined>(undefined)

  const filterOptions = ref<FilterOptions>({
    keyword: '',
    category: '',
    expiryStatus: '',
    tagIds: [],
  })

  const loadMedicineList = () => {
    let list = getMedicineList()
    if (list.length === 0) {
      list = mockMedicineList
      saveMedicineList(list)
    }
    medicineList.value = list
    searchContext.value = loadSearchContext()
  }

  const loadSearchContextData = () => {
    searchContext.value = loadSearchContext()
  }

  const searchMatchResults = computed<SearchMatchResult[]>(() => {
    const { keyword, category, expiryStatus, tagIds } = filterOptions.value
    
    let results: SearchMatchResult[] = []
    
    if (keyword && keyword.trim()) {
      results = medicineList.value
        .map(medicine => calculateMatchScore(medicine, keyword.trim(), searchContext.value))
        .filter(result => result.score > 0)
      
      if (results.length > 0) {
        const hasCorrection = results.some(r => r.correctedKeyword)
        if (hasCorrection) {
          correctedKeyword.value = results.find(r => r.correctedKeyword)?.correctedKeyword
        } else {
          correctedKeyword.value = undefined
        }
      }
    } else {
      correctedKeyword.value = undefined
      results = medicineList.value.map(medicine => ({
        medicine,
        score: 0,
        matchFields: [],
        matchReasons: [],
        isExpired: calculateExpiryStatus(medicine.expiryDate).status === 'expired',
        daysUntilExpiry: 0,
      }))
    }
    
    if (category) {
      results = results.filter(r => r.medicine.category === category)
    }
    
    if (expiryStatus) {
      results = results.filter(r => {
        const { status } = calculateExpiryStatus(r.medicine.expiryDate)
        return status === expiryStatus
      })
    }
    
    if (tagIds && tagIds.length > 0) {
      results = results.filter(r => {
        const medicineTagIds = r.medicine.tagIds || []
        return tagIds.some(tagId => medicineTagIds.includes(tagId))
      })
    }
    
    return rankResults(results, sortDimension.value)
  })

  const filteredMedicineList = computed(() => {
    return searchMatchResults.value.map(r => r.medicine)
  })

  const searchMatchInfo = computed(() => {
    return searchMatchResults.value
  })

  const statistics = computed<Statistics>(() => {
    const categories: Record<MedicineCategory, number> = {
      cold: 0,
      fever: 0,
      stomach: 0,
      antibiotic: 0,
      external: 0,
      chronic: 0,
      health: 0,
      other: 0,
    }
    let warning = 0
    let expired = 0

    medicineList.value.forEach((medicine) => {
      categories[medicine.category]++
      const { status } = calculateExpiryStatus(medicine.expiryDate)
      if (status === 'warning') warning++
      if (status === 'expired') expired++
    })

    return {
      total: medicineList.value.length,
      warning,
      expired,
      categories,
    }
  })

  const hotSearchTerms = computed(() => {
    const usageRecords = getUsageRecords()
    return getHotSearchTerms(medicineList.value, usageRecords, 8)
  })

  const recentSearches = computed(() => {
    return searchContext.value.recentSearches.slice(0, 10)
  })

  const performSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (!trimmedKeyword) {
      resetFilter()
      return
    }
    
    filterOptions.value.keyword = trimmedKeyword
    lastSearchKeyword.value = trimmedKeyword
    showSuggestions.value = false
    
    searchContext.value = recordSearch(trimmedKeyword)
  }

  const updateSuggestions = (input: string) => {
    if (!input || input.trim().length === 0) {
      searchSuggestions.value = generateSuggestions(
        '',
        medicineList.value,
        searchContext.value.recentSearches,
        8
      )
    } else {
      searchSuggestions.value = generateSuggestions(
        input,
        medicineList.value,
        searchContext.value.recentSearches,
        8
      )
    }
  }

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    filterOptions.value.keyword = suggestion.text
    lastSearchKeyword.value = suggestion.text
    showSuggestions.value = false
    searchContext.value = recordSearch(suggestion.text)
  }

  const setSortDimension = (dimension: SortDimension) => {
    sortDimension.value = dimension
  }

  const addMedicine = (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = getTodayString()
    const newMedicine: Medicine = {
      ...medicineData,
      tagIds: medicineData.tagIds || [],
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    medicineList.value.unshift(newMedicine)
    saveMedicineList(medicineList.value)
    return newMedicine
  }

  const updateMedicine = (id: string, medicineData: Partial<Medicine>) => {
    const index = medicineList.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      medicineList.value[index] = {
        ...medicineList.value[index],
        ...medicineData,
        updatedAt: getTodayString(),
      }
      saveMedicineList(medicineList.value)
      return medicineList.value[index]
    }
    return null
  }

  const deleteMedicine = (id: string) => {
    const index = medicineList.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      medicineList.value.splice(index, 1)
      saveMedicineList(medicineList.value)
      return true
    }
    return false
  }

  const getMedicineById = (id: string) => {
    return medicineList.value.find((m) => m.id === id)
  }

  const recordMedicineView = (medicineId: string, medicineName: string) => {
    searchContext.value = recordView(
      medicineId, 
      medicineName, 
      lastSearchKeyword.value || undefined
    )
  }

  const recordMedicineUse = (medicineId: string, medicineName: string) => {
    searchContext.value = recordUse(
      medicineId, 
      medicineName, 
      lastSearchKeyword.value || undefined
    )
  }

  const setFilter = (options: Partial<FilterOptions>) => {
    filterOptions.value = {
      ...filterOptions.value,
      ...options,
    }
  }

  const resetFilter = () => {
    filterOptions.value = {
      keyword: '',
      category: '',
      expiryStatus: '',
      tagIds: [],
    }
    sortDimension.value = 'relevance'
    lastSearchKeyword.value = ''
    correctedKeyword.value = undefined
    showSuggestions.value = false
    searchSuggestions.value = []
  }

  const clearHistory = () => {
    clearSearchHistory()
    loadSearchContextData()
  }

  const clearAllData = () => {
    clearAllSearchData()
    loadSearchContextData()
  }

  const getSearchExpansion = (keyword: string) => {
    return expandSearchTerms(keyword)
  }

  const getCorrection = (input: string) => {
    return correctTypo(input)
  }

  onMounted(() => {
    loadMedicineList()
  })

  return {
    medicineList,
    filteredMedicineList,
    searchMatchResults,
    searchMatchInfo,
    filterOptions,
    sortDimension,
    searchContext,
    searchSuggestions,
    showSuggestions,
    lastSearchKeyword,
    correctedKeyword,
    statistics,
    hotSearchTerms,
    recentSearches,
    loadMedicineList,
    loadSearchContextData,
    performSearch,
    updateSuggestions,
    selectSuggestion,
    setSortDimension,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineById,
    recordMedicineView,
    recordMedicineUse,
    setFilter,
    resetFilter,
    clearHistory,
    clearAllData,
    getSearchExpansion,
    getCorrection,
  }
}
