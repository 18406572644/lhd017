import { ref, onMounted } from 'vue'
import type { MedicineTag } from '@/types/medicine'
import { generateId, getTodayString } from '@/utils/date'
import { getTagList, saveTagList } from '@/utils/storage'

const DEFAULT_TAGS: MedicineTag[] = [
  { id: 'tag-001', name: '宝宝专用', color: '#EC407A', createdAt: '2024-01-01' },
  { id: 'tag-002', name: '旅行常备', color: '#4A90D9', createdAt: '2024-01-01' },
  { id: 'tag-003', name: '爸妈用药', color: '#AB47BC', createdAt: '2024-01-01' },
  { id: 'tag-004', name: '家庭急救', color: '#EF5350', createdAt: '2024-01-01' },
  { id: 'tag-005', name: '常用药', color: '#8BC34A', createdAt: '2024-01-01' },
]

export function useTag() {
  const tagList = ref<MedicineTag[]>([])

  const loadTagList = () => {
    let list = getTagList()
    if (list.length === 0) {
      list = DEFAULT_TAGS
      saveTagList(list)
    }
    tagList.value = list
  }

  const addTag = (name: string, color: string) => {
    const newTag: MedicineTag = {
      id: generateId(),
      name,
      color,
      createdAt: getTodayString(),
    }
    tagList.value.push(newTag)
    saveTagList(tagList.value)
    return newTag
  }

  const updateTag = (id: string, data: Partial<MedicineTag>) => {
    const index = tagList.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tagList.value[index] = {
        ...tagList.value[index],
        ...data,
      }
      saveTagList(tagList.value)
      return tagList.value[index]
    }
    return null
  }

  const deleteTag = (id: string) => {
    const index = tagList.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tagList.value.splice(index, 1)
      saveTagList(tagList.value)
      return true
    }
    return false
  }

  const getTagById = (id: string) => {
    return tagList.value.find((t) => t.id === id)
  }

  const getTagByIds = (ids: string[]) => {
    return ids.map((id) => tagList.value.find((t) => t.id === id)).filter(Boolean) as MedicineTag[]
  }

  onMounted(() => {
    loadTagList()
  })

  return {
    tagList,
    loadTagList,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagByIds,
  }
}
