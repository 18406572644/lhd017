import type { Medicine, UsageRecord } from '@/types/medicine'

const STORAGE_KEY = 'family-medicine-list'
const USAGE_RECORD_KEY = 'family-medicine-usage-records'

export function getMedicineList(): Medicine[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveMedicineList(list: Medicine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (error) {
    console.error('保存药品数据失败:', error)
  }
}

export function clearMedicineList(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUsageRecords(): UsageRecord[] {
  try {
    const data = localStorage.getItem(USAGE_RECORD_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveUsageRecords(records: UsageRecord[]): void {
  try {
    localStorage.setItem(USAGE_RECORD_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('保存用药记录失败:', error)
  }
}

export function addUsageRecord(record: UsageRecord): void {
  const records = getUsageRecords()
  records.unshift(record)
  saveUsageRecords(records)
}

export function deleteUsageRecord(id: string): void {
  const records = getUsageRecords()
  const filtered = records.filter((r) => r.id !== id)
  saveUsageRecords(filtered)
}

export function updateUsageRecord(id: string, data: Partial<UsageRecord>): void {
  const records = getUsageRecords()
  const index = records.findIndex((r) => r.id === id)
  if (index !== -1) {
    records[index] = { ...records[index], ...data }
    saveUsageRecords(records)
  }
}

export function getUsageRecordsByMedicineId(medicineId: string): UsageRecord[] {
  const records = getUsageRecords()
  return records.filter((r) => r.medicineId === medicineId)
}
