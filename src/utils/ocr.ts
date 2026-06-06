import type { OCRResult } from '@/types/prescription'

const mockMedicineTemplates = [
  {
    name: '阿莫西林胶囊',
    specification: '0.25g*24粒',
    dosage: '一次0.5g',
    frequency: '一日3次',
    quantity: 2,
    days: 7,
  },
  {
    name: '头孢克肟分散片',
    specification: '0.1g*6片',
    dosage: '一次0.1g',
    frequency: '一日2次',
    quantity: 2,
    days: 5,
  },
  {
    name: '奥美拉唑肠溶胶囊',
    specification: '20mg*14粒',
    dosage: '一次20mg',
    frequency: '一日1次',
    quantity: 1,
    days: 14,
  },
  {
    name: '硝苯地平缓释片',
    specification: '10mg*30片',
    dosage: '一次10mg',
    frequency: '一日2次',
    quantity: 2,
    days: 30,
  },
  {
    name: '盐酸二甲双胍片',
    specification: '0.5g*20片',
    dosage: '一次0.5g',
    frequency: '一日3次',
    quantity: 3,
    days: 30,
  },
  {
    name: '布洛芬缓释胶囊',
    specification: '0.3g*20粒',
    dosage: '一次0.3g',
    frequency: '一日2次',
    quantity: 1,
    days: 5,
  },
  {
    name: '氯雷他定片',
    specification: '10mg*6片',
    dosage: '一次10mg',
    frequency: '一日1次',
    quantity: 1,
    days: 6,
  },
  {
    name: '复方甘草片',
    specification: '100片/瓶',
    dosage: '一次3片',
    frequency: '一日3次',
    quantity: 1,
    days: 7,
  },
]

const mockDoctorNames = ['张医生', '李医生', '王医生', '刘医生', '陈医生']
const mockDepartments = ['内科', '外科', '儿科', '妇科', '骨科', '心内科', '内分泌科', '呼吸内科']
const mockHospitalNames = ['人民医院', '中心医院', '第一人民医院', '中医院', '协和医院', '医科大学附属医院']
const mockDiagnoses = ['上呼吸道感染', '高血压', '糖尿病', '急性支气管炎', '慢性胃炎', '过敏性鼻炎', '关节炎', '偏头痛']
const mockPatientNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(daysFromNow: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

function generateMockData(): NonNullable<OCRResult['data']> {
  const medicineCount = Math.floor(Math.random() * 3) + 1
  const shuffledMedicines = [...mockMedicineTemplates].sort(() => Math.random() - 0.5)
  const selectedMedicines = shuffledMedicines.slice(0, medicineCount)

  return {
    patientName: getRandomItem(mockPatientNames),
    patientAge: Math.floor(Math.random() * 60) + 18,
    patientGender: Math.random() > 0.5 ? 'male' : 'female',
    diagnosis: getRandomItem(mockDiagnoses),
    code: `RX${Date.now().toString().slice(-6)}`,
    doctorName: getRandomItem(mockDoctorNames),
    department: getRandomItem(mockDepartments),
    hospitalName: getRandomItem(mockHospitalNames),
    issueDate: getRandomDate(-Math.floor(Math.random() * 30)),
    expiryDate: getRandomDate(Math.floor(Math.random() * 60) + 30),
    medicines: selectedMedicines,
  }
}

export async function recognizePrescription(imageBase64: string): Promise<OCRResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const shouldFail = Math.random() < 0.05
      if (shouldFail) {
        resolve({
          success: false,
          message: 'OCR识别失败，请手动输入处方信息',
        })
      } else {
        resolve({
          success: true,
          data: generateMockData(),
          message: '识别成功，请核对信息',
        })
      }
    }, 2000 + Math.random() * 1000)
  })
}

export function getPrescriptionExpiryStatus(expiryDate: string): {
  status: 'active' | 'warning' | 'expired'
  daysLeft: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft }
  } else if (daysLeft <= 7) {
    return { status: 'warning', daysLeft }
  } else {
    return { status: 'active', daysLeft }
  }
}

export function formatPrescriptionDaysLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    return `已过期 ${Math.abs(daysLeft)} 天`
  } else if (daysLeft === 0) {
    return '今天到期'
  } else if (daysLeft === 1) {
    return '还剩 1 天'
  } else {
    return `还剩 ${daysLeft} 天`
  }
}
