import type { UsageRecord } from '@/types/medicine'
import { generateId } from '@/utils/date'

const today = new Date()
const subtractDays = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

const familyMembers = ['father', 'mother', 'grandpa', 'grandma', 'son', 'daughter', 'other']
const medicineNames = [
  '复方氨酚烷胺片',
  '布洛芬缓释胶囊',
  '蒙脱石散',
  '阿莫西林胶囊',
  '碘伏消毒液',
  '硝苯地平缓释片',
  '维生素C片',
  '健胃消食片',
  '氯雷他定片',
]

function generateMockUsageRecords(): UsageRecord[] {
  const records: UsageRecord[] = []
  let idCounter = 1

  for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
    const recordsPerDay = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < recordsPerDay; i++) {
      const usageDate = subtractDays(daysAgo)
      const medicineIndex = Math.floor(Math.random() * medicineNames.length)
      const memberIndex = Math.floor(Math.random() * familyMembers.length)

      records.push({
        id: `usage-${idCounter.toString().padStart(4, '0')}`,
        medicineId: `1-00${medicineIndex + 1}`,
        medicineName: medicineNames[medicineIndex],
        usageDate,
        date: usageDate,
        quantity: Math.floor(Math.random() * 3) + 1,
        familyMember: familyMembers[memberIndex],
        symptoms: ['感冒', '头痛', '腹泻', '发烧', '过敏', '高血压', '消化不良'][Math.floor(Math.random() * 7)],
        dosage: ['1片', '1粒', '1袋', '5ml', '10ml'][Math.floor(Math.random() * 5)],
        effect: ['excellent', 'good', 'average', 'poor'][Math.floor(Math.random() * 4)] as any,
        notes: '',
        createdAt: usageDate,
      })
      idCounter++
    }
  }

  return records
}

export const mockUsageRecords: UsageRecord[] = generateMockUsageRecords()

export function getMockUsageRecords(): UsageRecord[] {
  return [...mockUsageRecords]
}
