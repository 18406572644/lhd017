import type { Medicine, MedicineTag, UsageRecord, ExportOptions } from '@/types/medicine'
import { CATEGORY_LIST, EXPIRY_STATUS_INFO } from '@/types/medicine'
import { calculateExpiryStatus } from './date'
import { getUsageRecords } from './storage'

interface ExportData {
  medicines: Medicine[]
  tags?: MedicineTag[]
  usageRecords?: UsageRecord[]
  exportedAt: string
  version: string
}

const EXPORT_VERSION = '1.0.0'

const MEDICINE_FIELD_MAP: Record<string, { label: string; getValue: (m: Medicine, tags?: MedicineTag[]) => string }> = {
  id: { label: 'ID', getValue: (m) => m.id },
  name: { label: '药品名称', getValue: (m) => m.name },
  category: {
    label: '分类',
    getValue: (m) => CATEGORY_LIST.find((c) => c.value === m.category)?.label || m.category,
  },
  specification: { label: '规格', getValue: (m) => m.specification },
  manufacturer: { label: '生产厂家', getValue: (m) => m.manufacturer },
  productionDate: { label: '生产日期', getValue: (m) => m.productionDate },
  expiryDate: { label: '有效期至', getValue: (m) => m.expiryDate },
  expiryStatus: {
    label: '效期状态',
    getValue: (m) => EXPIRY_STATUS_INFO[calculateExpiryStatus(m.expiryDate).status].label,
  },
  quantity: { label: '数量', getValue: (m) => String(m.quantity) },
  storageLocation: { label: '存放位置', getValue: (m) => m.storageLocation },
  symptoms: { label: '适用症状', getValue: (m) => m.symptoms },
  usage: { label: '用法用量', getValue: (m) => m.usage },
  notes: { label: '注意事项', getValue: (m) => m.notes },
  tags: {
    label: '标签',
    getValue: (m, tags) => {
      if (!tags) return ''
      const tagNames = m.tagIds.map((id) => tags.find((t) => t.id === id)?.name).filter(Boolean)
      return tagNames.join('、')
    },
  },
  createdAt: { label: '创建时间', getValue: (m) => m.createdAt },
  updatedAt: { label: '更新时间', getValue: (m) => m.updatedAt },
}

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function generateCSV(medicines: Medicine[], tags: MedicineTag[]): string {
  const fields = Object.keys(MEDICINE_FIELD_MAP)
  const headers = fields.map((f) => MEDICINE_FIELD_MAP[f].label)
  const rows = medicines.map((medicine) => {
    return fields.map((field) => {
      const { getValue } = MEDICINE_FIELD_MAP[field]
      return escapeCSVValue(getValue(medicine, tags))
    })
  })

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

function generateJSON(
  medicines: Medicine[],
  options: ExportOptions,
  tags: MedicineTag[]
): string {
  const data: ExportData = {
    medicines,
    exportedAt: new Date().toISOString(),
    version: EXPORT_VERSION,
  }

  if (options.includeTags) {
    data.tags = tags
  }

  if (options.includeUsageRecords) {
    const medicineIds = new Set(medicines.map((m) => m.id))
    const allRecords = getUsageRecords()
    data.usageRecords = options.scope === 'filtered'
      ? allRecords.filter((r) => medicineIds.has(r.medicineId))
      : allRecords
  }

  return JSON.stringify(data, null, 2)
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateFilename(format: 'json' | 'csv', scope: 'all' | 'filtered'): string {
  const date = new Date().toISOString().split('T')[0]
  const scopeText = scope === 'all' ? '全部' : '筛选结果'
  return `药品数据_${scopeText}_${date}.${format}`
}

export function exportMedicineData(
  allMedicines: Medicine[],
  filteredMedicines: Medicine[],
  options: ExportOptions,
  tags: MedicineTag[]
): void {
  const medicines = options.scope === 'all' ? allMedicines : filteredMedicines
  const medicinesWithTags = medicines.map((m) => ({
    ...m,
    tagIds: m.tagIds || [],
  }))

  if (medicines.length === 0) {
    throw new Error('没有可导出的数据')
  }

  if (options.format === 'json') {
    const content = generateJSON(medicinesWithTags, options, tags)
    downloadFile(content, generateFilename('json', options.scope), 'application/json')
  } else if (options.format === 'csv') {
    const content = generateCSV(medicinesWithTags, tags)
    downloadFile(content, generateFilename('csv', options.scope), 'text/csv;charset=utf-8')
  }
}

export function importMedicineData(content: string): {
  medicines: Medicine[]
  tags?: MedicineTag[]
  usageRecords?: UsageRecord[]
} {
  try {
    const data: ExportData = JSON.parse(content)
    if (!data.medicines || !Array.isArray(data.medicines)) {
      throw new Error('数据格式不正确')
    }
    return {
      medicines: data.medicines.map((m) => ({ ...m, tagIds: m.tagIds || [] })),
      tags: data.tags,
      usageRecords: data.usageRecords,
    }
  } catch (error) {
    throw new Error('解析失败，请确保文件格式正确')
  }
}
