import { ref, computed, onMounted } from 'vue'
import type {
  Prescription,
  PrescriptionCategory,
  PrescriptionFilterOptions,
  PrescriptionStatistics,
  PrescriptionMedicine,
} from '@/types/prescription'
import { generateId, getTodayString } from '@/utils/date'
import { getPrescriptionList, savePrescriptionList, addPrescription, updatePrescription, deletePrescription } from '@/utils/storage'
import { getPrescriptionExpiryStatus } from '@/utils/ocr'
import { mockPrescriptionList } from '@/data/mockPrescription'

export function usePrescription() {
  const prescriptionList = ref<Prescription[]>([])
  const filterOptions = ref<PrescriptionFilterOptions>({
    keyword: '',
    category: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  const loadPrescriptionList = () => {
    let list = getPrescriptionList()
    if (list.length === 0) {
      list = mockPrescriptionList
      savePrescriptionList(list)
    }
    prescriptionList.value = list
  }

  const filteredPrescriptionList = computed(() => {
    return prescriptionList.value.filter((prescription) => {
      const { keyword, category, status, startDate, endDate } = filterOptions.value

      if (keyword) {
        const keywordLower = keyword.toLowerCase()
        const matchPatient = prescription.patientName.toLowerCase().includes(keywordLower)
        const matchDoctor = prescription.doctor.name.toLowerCase().includes(keywordLower)
        const matchHospital = prescription.hospital.name.toLowerCase().includes(keywordLower)
        const matchDiagnosis = prescription.diagnosis.toLowerCase().includes(keywordLower)
        const matchCode = prescription.code?.toLowerCase().includes(keywordLower)
        const matchMedicine = prescription.medicines.some((m) => m.name.toLowerCase().includes(keywordLower))
        if (!matchPatient && !matchDoctor && !matchHospital && !matchDiagnosis && !matchCode && !matchMedicine) {
          return false
        }
      }

      if (category && prescription.category !== category) {
        return false
      }

      if (status) {
        const { status: expiryStatus } = getPrescriptionExpiryStatus(prescription.expiryDate)
        if (expiryStatus !== status) {
          return false
        }
      }

      if (startDate && prescription.issueDate < startDate) {
        return false
      }

      if (endDate && prescription.issueDate > endDate) {
        return false
      }

      return true
    })
  })

  const statistics = computed<PrescriptionStatistics>(() => {
    const categories: Record<PrescriptionCategory, number> = {
      outpatient: 0,
      chronic: 0,
      emergency: 0,
      other: 0,
    }
    let active = 0
    let warning = 0
    let expired = 0

    prescriptionList.value.forEach((prescription) => {
      categories[prescription.category]++
      const { status } = getPrescriptionExpiryStatus(prescription.expiryDate)
      if (status === 'active') active++
      if (status === 'warning') warning++
      if (status === 'expired') expired++
    })

    return {
      total: prescriptionList.value.length,
      active,
      warning,
      expired,
      categories,
    }
  })

  const expiringSoon = computed(() => {
    return prescriptionList.value
      .filter((p) => {
        const { status } = getPrescriptionExpiryStatus(p.expiryDate)
        return status === 'warning'
      })
      .sort((a, b) => {
        const aDays = getPrescriptionExpiryStatus(a.expiryDate).daysLeft
        const bDays = getPrescriptionExpiryStatus(b.expiryDate).daysLeft
        return aDays - bDays
      })
  })

  const addPrescriptionItem = (
    prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = getTodayString()
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    prescriptionList.value.unshift(newPrescription)
    addPrescription(newPrescription)
    return newPrescription
  }

  const updatePrescriptionItem = (id: string, prescriptionData: Partial<Prescription>) => {
    const index = prescriptionList.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      prescriptionList.value[index] = {
        ...prescriptionList.value[index],
        ...prescriptionData,
        updatedAt: getTodayString(),
      }
      updatePrescription(id, prescriptionList.value[index])
      return prescriptionList.value[index]
    }
    return null
  }

  const deletePrescriptionItem = (id: string) => {
    const index = prescriptionList.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      prescriptionList.value.splice(index, 1)
      deletePrescription(id)
      return true
    }
    return false
  }

  const getPrescriptionItemById = (id: string) => {
    return prescriptionList.value.find((p) => p.id === id)
  }

  const setFilter = (options: Partial<PrescriptionFilterOptions>) => {
    filterOptions.value = {
      ...filterOptions.value,
      ...options,
    }
  }

  const resetFilter = () => {
    filterOptions.value = {
      keyword: '',
      category: '',
      status: '',
      startDate: '',
      endDate: '',
    }
  }

  const linkMedicineToPrescription = (prescriptionId: string, medicineIndex: number, medicineId: string) => {
    const prescription = getPrescriptionItemById(prescriptionId)
    if (prescription && prescription.medicines[medicineIndex]) {
      const updatedMedicines = [...prescription.medicines]
      updatedMedicines[medicineIndex] = {
        ...updatedMedicines[medicineIndex],
        medicineId,
      }
      return updatePrescriptionItem(prescriptionId, { medicines: updatedMedicines })
    }
    return null
  }

  const unlinkMedicineFromPrescription = (prescriptionId: string, medicineIndex: number) => {
    return linkMedicineToPrescription(prescriptionId, medicineIndex, '')
  }

  const checkExpiringReminders = () => {
    const expiring = expiringSoon.value
    if (expiring.length > 0) {
      return expiring.map((p) => ({
        id: p.id,
        patientName: p.patientName,
        diagnosis: p.diagnosis,
        expiryDate: p.expiryDate,
        daysLeft: getPrescriptionExpiryStatus(p.expiryDate).daysLeft,
      }))
    }
    return []
  }

  const getPrescriptionsByCategory = (category: PrescriptionCategory) => {
    return prescriptionList.value.filter((p) => p.category === category)
  }

  const getPrescriptionsByPatient = (patientName: string) => {
    return prescriptionList.value.filter((p) =>
      p.patientName.toLowerCase().includes(patientName.toLowerCase())
    )
  }

  onMounted(() => {
    loadPrescriptionList()
  })

  return {
    prescriptionList,
    filteredPrescriptionList,
    filterOptions,
    statistics,
    expiringSoon,
    loadPrescriptionList,
    addPrescriptionItem,
    updatePrescriptionItem,
    deletePrescriptionItem,
    getPrescriptionItemById,
    setFilter,
    resetFilter,
    linkMedicineToPrescription,
    unlinkMedicineFromPrescription,
    checkExpiringReminders,
    getPrescriptionsByCategory,
    getPrescriptionsByPatient,
  }
}
