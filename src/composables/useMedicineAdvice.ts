import { ref, computed } from 'vue'
import type { Medicine, MedicineRecommendation, SymptomMatch, SymptomKnowledge, UsageRecord, FamilyMember } from '@/types/medicine'
import { SEVERITY_INFO } from '@/types/medicine'
import { symptomKnowledgeBase, commonSymptomSuggestions, DISCLAIMER_TEXT } from '@/data/symptomKnowledge'
import { getMedicineList } from '@/utils/storage'
import { getUsageRecords, addUsageRecord, deleteUsageRecord, getUsageRecordsByMedicineId } from '@/utils/storage'
import { calculateExpiryStatus, generateId, getTodayString } from '@/utils/date'

export function useMedicineAdvice() {
  const symptomInput = ref('')
  const isAnalyzing = ref(false)
  const recommendations = ref<MedicineRecommendation[]>([])
  const matchedSymptoms = ref<SymptomKnowledge[]>([])
  const usageRecords = ref<UsageRecord[]>([])
  const showRecordForm = ref(false)
  const selectedMedicine = ref<Medicine | null>(null)

  const disclaimer = DISCLAIMER_TEXT

  const analyzeSymptoms = (input: string) => {
    isAnalyzing.value = true
    symptomInput.value = input

    const inputLower = input.toLowerCase()
    const matched: SymptomKnowledge[] = []
    const allMatchedKeywords: string[] = []

    symptomKnowledgeBase.forEach((symptom) => {
      const matchedKeywords = symptom.keywords.filter((keyword) =>
        inputLower.includes(keyword)
      )
      if (matchedKeywords.length > 0) {
        matched.push(symptom)
        allMatchedKeywords.push(...matchedKeywords)
      }
    })

    matchedSymptoms.value = matched

    if (matched.length === 0) {
      recommendations.value = []
      isAnalyzing.value = false
      return
    }

    const medicineList = getMedicineList()
    const recs: MedicineRecommendation[] = []

    medicineList.forEach((medicine) => {
      const symptomsLower = medicine.symptoms.toLowerCase()
      let totalScore = 0
      const symptomMatches: SymptomMatch[] = []
      const warnings: string[] = []

      matched.forEach((symptom) => {
        const matchedInMedicine = symptom.keywords.filter((keyword) =>
          symptomsLower.includes(keyword)
        )
        if (matchedInMedicine.length > 0) {
          const score = matchedInMedicine.length * 10
          totalScore += score
          symptomMatches.push({
            symptom: symptom.symptom,
            matchedKeywords: matchedInMedicine,
            matchScore: score,
          })
        }
      })

      if (allMatchedKeywords.some((keyword) => symptomsLower.includes(keyword))) {
        totalScore += 5
      }

      const { status } = calculateExpiryStatus(medicine.expiryDate)
      const isExpired = status === 'expired'

      if (isExpired) {
        warnings.push('该药品已过期，请勿使用！')
      } else if (status === 'warning') {
        warnings.push('该药品即将过期，请尽快使用或更换。')
      }

      if (medicine.notes) {
        warnings.push(medicine.notes)
      }

      if (totalScore > 0) {
        recs.push({
          medicine,
          matchScore: totalScore,
          matchedSymptoms: symptomMatches,
          warnings,
          isExpired,
        })
      }
    })

    recs.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return 1
      if (!a.isExpired && b.isExpired) return -1
      return b.matchScore - a.matchScore
    })

    recommendations.value = recs
    isAnalyzing.value = false
  }

  const quickSelectSymptom = (symptom: string) => {
    analyzeSymptoms(symptom)
  }

  const clearResults = () => {
    symptomInput.value = ''
    recommendations.value = []
    matchedSymptoms.value = []
  }

  const loadUsageRecords = () => {
    usageRecords.value = getUsageRecords()
  }

  const createUsageRecord = (data: {
    medicineId: string
    medicineName: string
    symptoms: string
    dosage: string
    effect: 'excellent' | 'good' | 'average' | 'poor'
    sideEffects: string
    notes: string
    familyMember: FamilyMember
  }) => {
    const record: UsageRecord = {
      id: generateId(),
      ...data,
      usageDate: getTodayString(),
      createdAt: getTodayString(),
    }
    addUsageRecord(record)
    loadUsageRecords()
    return record
  }

  const removeUsageRecord = (id: string) => {
    deleteUsageRecord(id)
    loadUsageRecords()
  }

  const getMedicineUsageHistory = (medicineId: string) => {
    return getUsageRecordsByMedicineId(medicineId)
  }

  const getEffectivenessStats = computed(() => {
    const stats = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      total: 0,
    }
    usageRecords.value.forEach((record) => {
      stats[record.effect]++
      stats.total++
    })
    return stats
  })

  const getMostUsedMedicines = computed(() => {
    const countMap = new Map<string, { name: string; count: number }>()
    usageRecords.value.forEach((record) => {
      const existing = countMap.get(record.medicineId)
      if (existing) {
        existing.count++
      } else {
        countMap.set(record.medicineId, {
          name: record.medicineName,
          count: 1,
        })
      }
    })
    return Array.from(countMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })

  const getTopSymptoms = computed(() => {
    const symptomMap = new Map<string, number>()
    usageRecords.value.forEach((record) => {
      const symptoms = record.symptoms.split(/[，,、\s]+/).filter((s) => s.trim())
      symptoms.forEach((symptom) => {
        const trimmed = symptom.trim()
        if (trimmed) {
          symptomMap.set(trimmed, (symptomMap.get(trimmed) || 0) + 1)
        }
      })
    })
    return Array.from(symptomMap.entries())
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  })

  const getSeverityWarning = computed(() => {
    const severeSymptoms = matchedSymptoms.value.filter((s) => s.severity === 'severe')
    const moderateSymptoms = matchedSymptoms.value.filter((s) => s.severity === 'moderate')

    if (severeSymptoms.length > 0) {
      return {
        level: 'severe',
        message: '您的症状可能较为严重，建议尽快就医！',
        info: SEVERITY_INFO.severe,
      }
    }
    if (moderateSymptoms.length > 0) {
      return {
        level: 'moderate',
        message: '请密切关注症状变化，如持续不缓解请及时就医。',
        info: SEVERITY_INFO.moderate,
      }
    }
    return {
      level: 'mild',
      message: '症状较轻，可参考建议护理，如有加重请及时就医。',
      info: SEVERITY_INFO.mild,
    }
  })

  return {
    symptomInput,
    isAnalyzing,
    recommendations,
    matchedSymptoms,
    usageRecords,
    showRecordForm,
    selectedMedicine,
    disclaimer,
    commonSymptomSuggestions,
    analyzeSymptoms,
    quickSelectSymptom,
    clearResults,
    loadUsageRecords,
    createUsageRecord,
    removeUsageRecord,
    getMedicineUsageHistory,
    getEffectivenessStats,
    getMostUsedMedicines,
    getTopSymptoms,
    getSeverityWarning,
  }
}
