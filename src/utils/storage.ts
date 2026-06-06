import type { Medicine, UsageRecord, MedicineTag } from '@/types/medicine'
import type { Prescription } from '@/types/prescription'
import { mockUsageRecords } from '@/data/mockUsageRecords'

const STORAGE_KEY = 'family-medicine-list'
const USAGE_RECORD_KEY = 'family-medicine-usage-records'
const TAG_KEY = 'family-medicine-tags'
const PRESCRIPTION_KEY = 'family-prescription-list'

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

export function getTagList(): MedicineTag[] {
  try {
    const data = localStorage.getItem(TAG_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTagList(tags: MedicineTag[]): void {
  try {
    localStorage.setItem(TAG_KEY, JSON.stringify(tags))
  } catch (error) {
    console.error('保存标签数据失败:', error)
  }
}

export function clearMedicineList(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUsageRecords(): UsageRecord[] {
  try {
    const data = localStorage.getItem(USAGE_RECORD_KEY)
    if (data) {
      return JSON.parse(data)
    }
    saveUsageRecords(mockUsageRecords)
    return mockUsageRecords
  } catch {
    return mockUsageRecords
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

export function getPrescriptionList(): Prescription[] {
  try {
    const data = localStorage.getItem(PRESCRIPTION_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function savePrescriptionList(list: Prescription[]): void {
  try {
    localStorage.setItem(PRESCRIPTION_KEY, JSON.stringify(list))
  } catch (error) {
    console.error('保存处方数据失败:', error)
  }
}

export function addPrescription(prescription: Prescription): void {
  const list = getPrescriptionList()
  list.unshift(prescription)
  savePrescriptionList(list)
}

export function updatePrescription(id: string, data: Partial<Prescription>): void {
  const list = getPrescriptionList()
  const index = list.findIndex((p) => p.id === id)
  if (index !== -1) {
    list[index] = { ...list[index], ...data }
    savePrescriptionList(list)
  }
}

export function deletePrescription(id: string): void {
  const list = getPrescriptionList()
  const filtered = list.filter((p) => p.id !== id)
  savePrescriptionList(filtered)
}

export function getPrescriptionById(id: string): Prescription | undefined {
  const list = getPrescriptionList()
  return list.find((p) => p.id === id)
}

export function clearPrescriptionList(): void {
  localStorage.removeItem(PRESCRIPTION_KEY)
}
