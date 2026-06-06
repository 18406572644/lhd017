export type PrescriptionCategory = 'outpatient' | 'chronic' | 'emergency' | 'other'

export type PrescriptionStatus = 'active' | 'expired' | 'warning'

export interface PrescriptionMedicine {
  medicineId?: string
  name: string
  specification: string
  dosage: string
  frequency: string
  quantity: number
  days: number
  notes?: string
}

export interface DoctorInfo {
  name: string
  department: string
  title?: string
  phone?: string
}

export interface HospitalInfo {
  name: string
  address?: string
  phone?: string
  level?: string
}

export interface Prescription {
  id: string
  category: PrescriptionCategory
  code?: string
  image: string
  medicines: PrescriptionMedicine[]
  doctor: DoctorInfo
  hospital: HospitalInfo
  issueDate: string
  expiryDate: string
  patientName: string
  patientAge?: number
  patientGender?: 'male' | 'female'
  diagnosis: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PrescriptionFilterOptions {
  keyword: string
  category: PrescriptionCategory | ''
  status: PrescriptionStatus | ''
  startDate: string
  endDate: string
}

export interface PrescriptionStatistics {
  total: number
  active: number
  warning: number
  expired: number
  categories: Record<PrescriptionCategory, number>
}

export interface OCRResult {
  success: boolean
  data?: {
    patientName?: string
    patientAge?: number
    patientGender?: 'male' | 'female'
    diagnosis?: string
    code?: string
    doctorName?: string
    department?: string
    hospitalName?: string
    issueDate?: string
    expiryDate?: string
    medicines?: Array<{
      name: string
      specification: string
      dosage: string
      frequency: string
      quantity: number
      days: number
    }>
  }
  message?: string
}

export const PRESCRIPTION_CATEGORY_LABELS: Record<PrescriptionCategory, string> = {
  outpatient: '门诊处方',
  chronic: '慢病处方',
  emergency: '急诊处方',
  other: '其他处方',
}

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  active: '有效',
  warning: '即将过期',
  expired: '已过期',
}
