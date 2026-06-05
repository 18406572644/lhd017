import type { Medicine } from '@/types/medicine'

const STORAGE_KEY = 'family-medicine-list'

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
