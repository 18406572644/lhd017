import { ref, computed, onMounted } from 'vue'
import type { Medicine, MedicineCategory, FilterOptions, Statistics } from '@/types/medicine'
import { calculateExpiryStatus, generateId, getTodayString } from '@/utils/date'
import { getMedicineList, saveMedicineList } from '@/utils/storage'
import { mockMedicineList } from '@/data/mockData'

export function useMedicine() {
  const medicineList = ref<Medicine[]>([])
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
  }

  const filteredMedicineList = computed(() => {
    return medicineList.value.filter((medicine) => {
      const { keyword, category, expiryStatus, tagIds } = filterOptions.value
      if (keyword) {
        const keywordLower = keyword.toLowerCase()
        const matchName = medicine.name.toLowerCase().includes(keywordLower)
        const matchSymptoms = medicine.symptoms.toLowerCase().includes(keywordLower)
        const matchManufacturer = medicine.manufacturer.toLowerCase().includes(keywordLower)
        if (!matchName && !matchSymptoms && !matchManufacturer) {
          return false
        }
      }
      if (category && medicine.category !== category) {
        return false
      }
      if (expiryStatus) {
        const { status } = calculateExpiryStatus(medicine.expiryDate)
        if (status !== expiryStatus) {
          return false
        }
      }
      if (tagIds && tagIds.length > 0) {
        const medicineTagIds = medicine.tagIds || []
        const hasTag = tagIds.some((tagId) => medicineTagIds.includes(tagId))
        if (!hasTag) {
          return false
        }
      }
      return true
    })
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
  }

  onMounted(() => {
    loadMedicineList()
  })

  return {
    medicineList,
    filteredMedicineList,
    filterOptions,
    statistics,
    loadMedicineList,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineById,
    setFilter,
    resetFilter,
  }
}
