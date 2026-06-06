import { symptomKnowledgeBase } from '@/data/symptomKnowledge'

const commonTypos: Record<string, string[]> = {
  '感昌': ['感冒'],
  '发浇': ['发烧'],
  '头通': ['头痛'],
  '头疼': ['头痛'],
  '咳嗽': ['咳嗽'],
  '胃涨': ['胃胀'],
  '拉肚': ['拉肚子', '腹泻'],
  '拉肚孑': ['拉肚子', '腹泻'],
  '棵粒': ['颗粒'],
  '胶襄': ['胶囊'],
  '消淡': ['消炎'],
  '止刻': ['止咳'],
  '化痰': ['化痰'],
  '止泄': ['止泻'],
  '牙疼': ['牙痛'],
  '喉咙痛': ['咽喉痛'],
  '扁挑体': ['扁桃体'],
  '流鼻涕': ['流涕'],
  '打喷涕': ['打喷嚏'],
  '恶新': ['恶心'],
  '呕土': ['呕吐'],
  '便密': ['便秘'],
  '失珉': ['失眠'],
  '肖化不良': ['消化不良'],
  '感帽灵': ['感冒灵'],
  '复方安酚': ['复方氨酚'],
  '布络芬': ['布洛芬'],
  '阿莫西宁': ['阿莫西林'],
  '蒙托石': ['蒙脱石'],
  '氯雷它定': ['氯雷他定'],
  '健胃消失片': ['健胃消食片'],
  '维生维C': ['维生素C'],
  '肖苯地平': ['硝苯地平'],
  '碘伏': ['碘伏'],
  '创可贴': ['创可贴'],
  '泻立停': ['泻立停'],
  '止痛片': ['止痛片'],
  '退热贴': ['退热贴'],
}

const semanticIntentMap: Record<string, string[]> = {
  '治': ['治疗', '医治'],
  '治头疼的': ['头痛'],
  '治头痛的': ['头痛'],
  '治发烧的': ['发热', '发烧'],
  '治感冒的': ['感冒'],
  '治咳嗽的': ['咳嗽'],
  '治胃痛的': ['胃痛'],
  '治拉肚子的': ['腹泻', '拉肚子'],
  '治牙疼的': ['牙痛'],
  '治过敏的': ['过敏'],
  '治失眠的': ['失眠'],
  '治便秘的': ['便秘'],
  '治痛经的': ['痛经'],
  '治关节痛的': ['关节痛'],
  '治烫伤的': ['烫伤'],
  '治外伤的': ['外伤'],
  '治消化不良的': ['消化不良'],
  '止疼': ['止痛'],
  '退烧': ['退热', '发热'],
  '消炎': ['抗炎'],
  '抗过敏': ['过敏'],
  '止吐': ['止呕', '呕吐'],
  '止泻': ['腹泻', '拉肚子'],
  '止咳': ['咳嗽'],
  '化痰': ['咳嗽', '咳痰'],
  '清热解毒': ['清热', '解毒', '感冒'],
  '感冒药': ['感冒'],
  '退烧药': ['发热', '发烧'],
  '止痛药': ['止痛', '头痛', '关节痛', '牙痛'],
  '消炎药': ['抗炎', '抗生素'],
  '胃药': ['胃痛', '消化不良', '腹泻'],
  '肠胃药': ['胃痛', '消化不良', '腹泻'],
  '皮肤药': ['过敏', '外伤', '烫伤'],
  '头疼药': ['头痛'],
  '牙痛药': ['牙痛'],
  '拉肚子药': ['腹泻'],
  '过敏药': ['过敏'],
  '助眠药': ['失眠'],
  '维生素': ['维生素'],
  '保健品': ['保健'],
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

export function fuzzyMatch(input: string, target: string, threshold: number = 2): boolean {
  if (!input || !target) return false
  const inputLower = input.toLowerCase()
  const targetLower = target.toLowerCase()
  
  if (targetLower.includes(inputLower)) return true
  
  const distance = levenshteinDistance(inputLower, targetLower)
  const maxLen = Math.max(inputLower.length, targetLower.length)
  const similarity = 1 - distance / maxLen
  
  if (inputLower.length <= 3) {
    return distance <= 1
  } else if (inputLower.length <= 5) {
    return distance <= threshold
  } else {
    return similarity >= 0.7
  }
}

export function correctTypo(input: string): string {
  if (!input) return input
  
  for (const [typo, corrections] of Object.entries(commonTypos)) {
    if (input.includes(typo)) {
      return input.replace(typo, corrections[0])
    }
  }
  
  for (const [typo, corrections] of Object.entries(commonTypos)) {
    if (fuzzyMatch(input, typo, 1)) {
      return corrections[0]
    }
  }
  
  return input
}

export function getSemanticKeywords(input: string): string[] {
  const keywords: string[] = []
  
  for (const [intent, symptoms] of Object.entries(semanticIntentMap)) {
    if (input.includes(intent) || fuzzyMatch(input, intent, 1)) {
      keywords.push(...symptoms)
    }
  }
  
  if (/治(.+?)的/.test(input)) {
    const match = input.match(/治(.+?)的/)
    if (match) {
      const symptom = match[1]
      keywords.push(symptom)
      
      symptomKnowledgeBase.forEach(sk => {
        if (sk.keywords.some(kw => fuzzyMatch(symptom, kw, 1))) {
          keywords.push(sk.symptom)
          keywords.push(...sk.keywords)
        }
      })
    }
  }
  
  if (input.includes('药')) {
    const match = input.match(/(.+?)药/)
    if (match) {
      const symptom = match[1]
      if (symptom && symptom.length > 0) {
        symptomKnowledgeBase.forEach(sk => {
          if (sk.keywords.some(kw => fuzzyMatch(symptom, kw, 1))) {
            keywords.push(sk.symptom)
            keywords.push(...sk.keywords)
          }
        })
      }
    }
  }
  
  symptomKnowledgeBase.forEach(sk => {
    if (sk.keywords.some(kw => input.includes(kw) || fuzzyMatch(input, kw, 1))) {
      keywords.push(sk.symptom)
      keywords.push(...sk.keywords)
      keywords.push(...sk.relatedSymptoms)
    }
  })
  
  return [...new Set(keywords)]
}

export function getFuzzyCorrection(input: string, candidates: string[]): { corrected: string; confidence: number } | null {
  if (!input || !candidates || candidates.length === 0) return null
  
  let bestMatch: string | null = null
  let bestSimilarity = 0
  
  for (const candidate of candidates) {
    const distance = levenshteinDistance(input.toLowerCase(), candidate.toLowerCase())
    const maxLen = Math.max(input.length, candidate.length)
    const similarity = 1 - distance / maxLen
    
    if (similarity > bestSimilarity && similarity >= 0.6) {
      bestSimilarity = similarity
      bestMatch = candidate
    }
  }
  
  if (bestMatch) {
    return { corrected: bestMatch, confidence: bestSimilarity }
  }
  
  return null
}

export function expandSearchTerms(input: string): {
  original: string
  corrected: string
  synonyms: string[]
  semantic: string[]
  pinyinInitial: string
} {
  const corrected = correctTypo(input)
  const semantic = getSemanticKeywords(input)
  
  const synonyms: string[] = []
  symptomKnowledgeBase.forEach(sk => {
    if (sk.keywords.some(kw => 
      input.includes(kw) || 
      corrected.includes(kw) || 
      semantic.includes(sk.symptom)
    )) {
      synonyms.push(...sk.keywords)
    }
  })
  
  return {
    original: input,
    corrected,
    synonyms: [...new Set(synonyms)],
    semantic,
    pinyinInitial: '',
  }
}
