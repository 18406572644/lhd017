import type { Medicine, MedicineCategory } from '@/types/medicine'
import { MEDICINE_CATEGORY_LABELS } from '@/types/medicine'
import { symptomKnowledgeBase } from '@/data/symptomKnowledge'
import { getPinyinInitial } from './pinyin'
import { fuzzyMatch, correctTypo } from './fuzzyMatch'

export interface SearchSuggestion {
  text: string
  type: 'medicine' | 'symptom' | 'category' | 'history'
  highlight?: string
  pinyinInitial?: string
}

export function generateSuggestions(
  input: string,
  medicines: Medicine[],
  history: string[] = [],
  limit: number = 8
): SearchSuggestion[] {
  if (!input || input.trim().length === 0) {
    return getDefaultSuggestions(medicines, history, limit)
  }

  const trimmedInput = input.trim()
  const correctedInput = correctTypo(trimmedInput)
  const inputLower = trimmedInput.toLowerCase()
  const pinyinInput = getPinyinInitial(trimmedInput).toLowerCase()

  const suggestions: SearchSuggestion[] = []
  const seenTexts = new Set<string>()

  const addSuggestion = (text: string, type: SearchSuggestion['type']) => {
    if (seenTexts.has(text)) return
    if (suggestions.length >= limit) return
    seenTexts.add(text)
    suggestions.push({
      text,
      type,
      pinyinInitial: getPinyinInitial(text),
    })
  }

  medicines.forEach(med => {
    if (med.name.toLowerCase().includes(inputLower)) {
      addSuggestion(med.name, 'medicine')
    } else if (getPinyinInitial(med.name).toLowerCase().includes(pinyinInput)) {
      addSuggestion(med.name, 'medicine')
    } else if (fuzzyMatch(inputLower, med.name.toLowerCase(), 2)) {
      addSuggestion(med.name, 'medicine')
    }
  })

  symptomKnowledgeBase.forEach(sk => {
    if (sk.symptom.includes(trimmedInput) || 
        sk.keywords.some(kw => kw.includes(trimmedInput) || fuzzyMatch(trimmedInput, kw, 1))) {
      addSuggestion(sk.symptom, 'symptom')
    }
  })

  Object.entries(MEDICINE_CATEGORY_LABELS).forEach(([key, label]) => {
    if (label.includes(trimmedInput) || fuzzyMatch(trimmedInput, label, 1)) {
      addSuggestion(label, 'category')
    }
  })

  history.forEach(h => {
    if (h.includes(trimmedInput) || fuzzyMatch(trimmedInput, h, 1)) {
      addSuggestion(h, 'history')
    }
  })

  if (correctedInput !== trimmedInput) {
    addSuggestion(correctedInput, 'symptom')
  }

  if (suggestions.length < limit) {
    medicines.forEach(med => {
      if (med.symptoms.includes(trimmedInput) || 
          med.manufacturer.toLowerCase().includes(inputLower)) {
        addSuggestion(med.name, 'medicine')
      }
    })
  }

  return suggestions.slice(0, limit)
}

function getDefaultSuggestions(
  medicines: Medicine[],
  history: string[],
  limit: number
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  const seenTexts = new Set<string>()

  const addSuggestion = (text: string, type: SearchSuggestion['type']) => {
    if (seenTexts.has(text)) return
    if (suggestions.length >= limit) return
    seenTexts.add(text)
    suggestions.push({
      text,
      type,
      pinyinInitial: getPinyinInitial(text),
    })
  }

  history.slice(0, 3).forEach(h => addSuggestion(h, 'history'))

  medicines.slice(0, 3).forEach(m => addSuggestion(m.name, 'medicine'))

  symptomKnowledgeBase.slice(0, 3).forEach(sk => addSuggestion(sk.symptom, 'symptom'))

  Object.values(MEDICINE_CATEGORY_LABELS).slice(0, 2).forEach(label => {
    addSuggestion(label, 'category')
  })

  return suggestions.slice(0, limit)
}

export function getHotSearchTerms(medicines: Medicine[], usageRecords: any[], limit: number = 6): string[] {
  const termFrequency: Record<string, number> = {}

  medicines.forEach(med => {
    termFrequency[med.name] = (termFrequency[med.name] || 0) + 1
    const symptoms = med.symptoms.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
    symptoms.forEach(s => {
      termFrequency[s] = (termFrequency[s] || 0) + 1
    })
  })

  usageRecords.forEach(record => {
    if (record.medicineName) {
      termFrequency[record.medicineName] = (termFrequency[record.medicineName] || 0) + 2
    }
    if (record.symptoms) {
      const symptoms = record.symptoms.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
      symptoms.forEach(s => {
        termFrequency[s] = (termFrequency[s] || 0) + 1
      })
    }
  })

  return Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term)
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<em>$1</em>')
}
