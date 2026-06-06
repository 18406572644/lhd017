import { ref, computed } from 'vue'
import type {
  InteractionCheckResult,
  ContraindicationCheckResult,
  ComprehensiveCheckResult,
  InteractionRiskLevel,
  SpecialPeriodType,
  UsageRecord,
  CheckHistory,
} from '@/types/medicine'
import { INTERACTION_RISK_INFO } from '@/types/medicine'
import { findDrugInteraction, findInteractionsForDrug, INTERACTION_DISCLAIMER } from '@/data/drugInteractionKnowledge'
import { findContraindications, CONTRAINDICATION_DISCLAIMER } from '@/data/specialPeriodContraindications'
import { getUsageRecords, getSpecialPeriodsForMember, addCheckHistory } from '@/utils/storage'
import { generateId, getTodayString } from '@/utils/date'

export function useDrugInteraction() {
  const isChecking = ref(false)
  const lastCheckResult = ref<ComprehensiveCheckResult | null>(null)
  const checkHistory = ref<CheckHistory[]>([])

  const disclaimer = INTERACTION_DISCLAIMER
  const contraindicationDisclaimer = CONTRAINDICATION_DISCLAIMER

  const getRecentUsageRecords = (days: number = 7, familyMember?: string): UsageRecord[] => {
    const allRecords = getUsageRecords()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = cutoffDate.toISOString().split('T')[0]

    return allRecords.filter((record) => {
      const recordDate = record.usageDate || record.date || record.createdAt
      if (!recordDate) return false
      const dateStr = recordDate.split('T')[0]
      const dateMatch = dateStr >= cutoffStr
      const memberMatch = familyMember ? record.familyMember === familyMember : true
      return dateMatch && memberMatch
    })
  }

  const checkDrugInteraction = (
    drugAName: string,
    drugBName: string
  ): InteractionCheckResult | null => {
    const interaction = findDrugInteraction(drugAName, drugBName)
    if (!interaction) return null

    const isARecordB =
      interaction.drugAName.toLowerCase().includes(drugAName.toLowerCase().trim()) ||
      interaction.drugAAliases.some((alias) => alias.toLowerCase().includes(drugAName.toLowerCase().trim()))

    return {
      drugName: isARecordB ? interaction.drugBName : interaction.drugAName,
      interactingDrugName: isARecordB ? interaction.drugAName : interaction.drugBName,
      type: interaction.type,
      riskLevel: interaction.riskLevel,
      mechanism: interaction.mechanism,
      symptoms: interaction.symptoms,
      suggestions: interaction.suggestions,
    }
  }

  const checkInteractionsWithHistory = (
    newDrugName: string,
    familyMember?: string,
    days: number = 7
  ): InteractionCheckResult[] => {
    const recentRecords = getRecentUsageRecords(days, familyMember)
    const checkedDrugs = new Set<string>()
    const results: InteractionCheckResult[] = []

    recentRecords.forEach((record) => {
      const existingDrugName = record.medicineName
      if (checkedDrugs.has(existingDrugName)) return
      if (existingDrugName.toLowerCase().trim() === newDrugName.toLowerCase().trim()) return

      checkedDrugs.add(existingDrugName)
      const interaction = checkDrugInteraction(newDrugName, existingDrugName)
      if (interaction) {
        interaction.interactionDate = record.usageDate || record.date || record.createdAt
        results.push(interaction)
      }
    })

    return results
  }

  const checkContraindications = (
    drugName: string,
    specialPeriods: SpecialPeriodType[]
  ): ContraindicationCheckResult[] => {
    const contraindications = findContraindications(drugName, specialPeriods)
    return contraindications.map((contra) => ({
      drugName: contra.drugName,
      specialPeriod: contra.specialPeriod,
      riskLevel: contra.riskLevel,
      mechanism: contra.mechanism,
      symptoms: contra.symptoms,
      suggestions: contra.suggestions,
      alternativeDrugs: contra.alternativeDrugs,
    }))
  }

  const determineOverallRisk = (
    interactionResults: InteractionCheckResult[],
    contraindicationResults: ContraindicationCheckResult[]
  ): InteractionRiskLevel => {
    const allResults = [...interactionResults, ...contraindicationResults]
    if (allResults.length === 0) return 'safe'

    const hasDanger = allResults.some((r) => r.riskLevel === 'danger')
    if (hasDanger) return 'danger'

    const hasCaution = allResults.some((r) => r.riskLevel === 'caution')
    if (hasCaution) return 'caution'

    return 'safe'
  }

  const comprehensiveCheck = (
    newDrugName: string,
    familyMember?: string,
    days: number = 7
  ): ComprehensiveCheckResult => {
    isChecking.value = true

    const specialPeriods = familyMember ? getSpecialPeriodsForMember(familyMember) : []
    const interactionResults = checkInteractionsWithHistory(newDrugName, familyMember, days)
    const contraindicationResults = checkContraindications(newDrugName, specialPeriods)

    const allCheckedDrugs = new Set<string>([newDrugName])
    const recentRecords = getRecentUsageRecords(days, familyMember)
    recentRecords.forEach((r) => allCheckedDrugs.add(r.medicineName))

    const safeDrugs: string[] = []
    const riskyDrugs = new Set([
      ...interactionResults.map((r) => r.drugName),
      ...interactionResults.map((r) => r.interactingDrugName),
      ...contraindicationResults.map((r) => r.drugName),
    ])

    allCheckedDrugs.forEach((drug) => {
      if (!riskyDrugs.has(drug)) {
        safeDrugs.push(drug)
      }
    })

    const overallRisk = determineOverallRisk(interactionResults, contraindicationResults)

    const result: ComprehensiveCheckResult = {
      overallRisk,
      interactionResults,
      contraindicationResults,
      safeDrugs,
      checkedDate: getTodayString(),
    }

    lastCheckResult.value = result

    const checkHistoryRecord: CheckHistory = {
      id: generateId(),
      checkedDrugs: Array.from(allCheckedDrugs),
      result,
      createdAt: getTodayString(),
      familyMember,
    }
    addCheckHistory(checkHistoryRecord)
    checkHistory.value.unshift(checkHistoryRecord)

    isChecking.value = false

    return result
  }

  const checkMultipleDrugs = (
    drugNames: string[],
    familyMember?: string
  ): ComprehensiveCheckResult => {
    isChecking.value = true

    const specialPeriods = familyMember ? getSpecialPeriodsForMember(familyMember) : []
    const interactionResults: InteractionCheckResult[] = []
    const contraindicationResults: ContraindicationCheckResult[] = []

    for (let i = 0; i < drugNames.length; i++) {
      for (let j = i + 1; j < drugNames.length; j++) {
        const interaction = checkDrugInteraction(drugNames[i], drugNames[j])
        if (interaction) {
          interactionResults.push(interaction)
        }
      }

      const contra = checkContraindications(drugNames[i], specialPeriods)
      contraindicationResults.push(...contra)
    }

    const overallRisk = determineOverallRisk(interactionResults, contraindicationResults)

    const result: ComprehensiveCheckResult = {
      overallRisk,
      interactionResults,
      contraindicationResults,
      safeDrugs: [],
      checkedDate: getTodayString(),
    }

    lastCheckResult.value = result
    isChecking.value = false

    return result
  }

  const getDrugInteractionInfo = (drugName: string) => {
    return findInteractionsForDrug(drugName)
  }

  const getRiskSummary = (result: ComprehensiveCheckResult) => {
    const dangerCount = result.interactionResults.filter((r) => r.riskLevel === 'danger').length +
      result.contraindicationResults.filter((r) => r.riskLevel === 'danger').length
    const cautionCount = result.interactionResults.filter((r) => r.riskLevel === 'caution').length +
      result.contraindicationResults.filter((r) => r.riskLevel === 'caution').length
    const safeCount = result.safeDrugs.length

    return {
      dangerCount,
      cautionCount,
      safeCount,
      totalChecks: dangerCount + cautionCount + safeCount,
    }
  }

  const riskInfo = computed(() => INTERACTION_RISK_INFO)

  return {
    isChecking,
    lastCheckResult,
    checkHistory,
    disclaimer,
    contraindicationDisclaimer,
    riskInfo,
    getRecentUsageRecords,
    checkDrugInteraction,
    checkInteractionsWithHistory,
    checkContraindications,
    comprehensiveCheck,
    checkMultipleDrugs,
    getDrugInteractionInfo,
    getRiskSummary,
    determineOverallRisk,
  }
}
