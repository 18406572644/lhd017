<script setup lang="ts">
import { computed } from 'vue'
import {
  ColdDrink, HotWater, Goblet, DataAnalysis, FirstAidKit, Cherry, Apple, Box,
  Location, Calendar, Goods, OfficeBuilding, Edit,
} from '@element-plus/icons-vue'
import type { Medicine, MedicineTag } from '@/types/medicine'
import { CATEGORY_LIST, EXPIRY_STATUS_INFO } from '@/types/medicine'
import { calculateExpiryStatus, formatDaysLeft } from '@/utils/date'

interface Props {
  visible: boolean
  medicine: Medicine | null
  tags: MedicineTag[]
}

const props = withDefaults(defineProps<Props>(), {
  medicine: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'edit', medicine: Medicine): void
}>()

const expiryInfo = computed(() => {
  if (!props.medicine) return { status: 'normal' as const, daysLeft: 0 }
  return calculateExpiryStatus(props.medicine.expiryDate)
})

const statusInfo = computed(() => {
  return EXPIRY_STATUS_INFO[expiryInfo.value.status]
})

const categoryInfo = computed(() => {
  if (!props.medicine) return CATEGORY_LIST[7]
  return CATEGORY_LIST.find((c) => c.value === props.medicine.category) || CATEGORY_LIST[7]
})

const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    ColdDrink,
    HotWater,
    Goblet,
    DataAnalysis,
    FirstAidKit,
    Cherry,
    Apple,
    Box,
  }
  return iconMap[categoryInfo.value.icon] || Box
})

const medicineTags = computed(() => {
  if (!props.medicine) return []
  const tagIds = props.medicine.tagIds || []
  return props.tags.filter((t) => tagIds.includes(t.id))
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleEdit = () => {
  if (props.medicine) {
    emit('edit', props.medicine)
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="药品详情"
    width="560px"
    @update:model-value="handleClose"
    class="medicine-detail-dialog"
  >
    <div v-if="medicine" class="medicine-detail">
      <div v-if="medicine.image" class="medicine-detail__image-wrap">
        <img :src="medicine.image" :alt="medicine.name" class="medicine-detail__image" />
      </div>

      <div class="medicine-detail__header">
        <div
          v-if="!medicine.image"
          class="medicine-detail__icon"
          :style="{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }"
        >
          <el-icon :size="36">
            <component :is="iconComponent" />
          </el-icon>
        </div>
        <div class="medicine-detail__title-wrap">
          <h2 class="medicine-detail__title">{{ medicine.name }}</h2>
          <div class="medicine-detail__labels">
            <span
              class="medicine-detail__category"
              :style="{ backgroundColor: categoryInfo.color + '15', color: categoryInfo.color }"
            >
              {{ categoryInfo.label }}
            </span>
            <span
              v-for="tag in medicineTags"
              :key="tag.id"
              class="medicine-detail__tag"
              :style="{
                backgroundColor: tag.color + '15',
                color: tag.color,
                borderColor: tag.color + '40',
              }"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="medicine-detail__expiry">
        <div
          class="medicine-detail__expiry-badge"
          :style="{
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.color,
          }"
          :class="{ breathe: expiryInfo.status === 'warning' }"
        >
          <span
            class="medicine-detail__expiry-dot"
            :style="{ backgroundColor: statusInfo.color }"
          />
          {{ statusInfo.label }}
        </div>
        <span
          class="medicine-detail__expiry-days"
          :style="{ color: statusInfo.color }"
        >
          {{ formatDaysLeft(expiryInfo.daysLeft) }}
        </span>
      </div>

      <div class="medicine-detail__section">
        <h3 class="medicine-detail__section-title">基本信息</h3>
        <div class="medicine-detail__grid">
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><Goods /></el-icon>
              规格
            </div>
            <div class="medicine-detail__item-value">{{ medicine.specification }}</div>
          </div>
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><OfficeBuilding /></el-icon>
              生产厂家
            </div>
            <div class="medicine-detail__item-value">{{ medicine.manufacturer || '暂无' }}</div>
          </div>
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><Calendar /></el-icon>
              生产日期
            </div>
            <div class="medicine-detail__item-value">{{ medicine.productionDate }}</div>
          </div>
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><Calendar /></el-icon>
              有效期至
            </div>
            <div class="medicine-detail__item-value">{{ medicine.expiryDate }}</div>
          </div>
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><Goods /></el-icon>
              数量
            </div>
            <div class="medicine-detail__item-value">
              <span class="medicine-detail__quantity">{{ medicine.quantity }}</span> 盒/瓶
            </div>
          </div>
          <div class="medicine-detail__item">
            <div class="medicine-detail__item-label">
              <el-icon><Location /></el-icon>
              存放位置
            </div>
            <div class="medicine-detail__item-value">{{ medicine.storageLocation }}</div>
          </div>
        </div>
      </div>

      <div class="medicine-detail__section">
        <h3 class="medicine-detail__section-title">用药备注</h3>
        <div class="medicine-detail__notes">
          <div class="medicine-detail__note-item">
            <div class="medicine-detail__note-label">适用症状</div>
            <div class="medicine-detail__note-content">
              {{ medicine.symptoms || '暂无描述' }}
            </div>
          </div>
          <div class="medicine-detail__note-item">
            <div class="medicine-detail__note-label">用法用量</div>
            <div class="medicine-detail__note-content">
              {{ medicine.usage || '暂无描述' }}
            </div>
          </div>
          <div class="medicine-detail__note-item">
            <div class="medicine-detail__note-label">注意事项</div>
            <div class="medicine-detail__note-content">
              {{ medicine.notes || '暂无描述' }}
            </div>
          </div>
        </div>
      </div>

      <div class="medicine-detail__meta">
        <span>创建时间：{{ medicine.createdAt }}</span>
        <span v-if="medicine.updatedAt !== medicine.createdAt">
          更新时间：{{ medicine.updatedAt }}
        </span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit">
        <el-icon><Edit /></el-icon>
        编辑药品
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.medicine-detail-dialog {
  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--color-border-light);
  }
}

.medicine-detail {
  &__image-wrap {
    margin: -20px -24px 20px;
    height: 240px;
    overflow: hidden;
    background: var(--color-bg);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border-light);
  }

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title-wrap {
    flex: 1;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 12px 0;
  }

  &__labels {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__category {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
  }

  &__tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid;
  }

  &__expiry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px 20px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
  }

  &__expiry-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 500;
  }

  &__expiry-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__expiry-days {
    font-size: 14px;
    font-weight: 600;
  }

  &__section {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 16px;
    }
  }

  &__section-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 16px 0;
    padding-left: 10px;
    border-left: 3px solid var(--color-primary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-secondary);

    .el-icon {
      font-size: 14px;
    }
  }

  &__item-value {
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
  }

  &__quantity {
    color: var(--color-primary);
    font-size: 18px;
    font-weight: 700;
  }

  &__notes {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__note-item {
    padding: 16px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
  }

  &__note-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  &__note-content {
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.7;
  }

  &__meta {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    padding-top: 16px;
    font-size: 12px;
    color: var(--color-text-light);
    border-top: 1px dashed var(--color-border-light);
  }
}

@media (max-width: 600px) {
  .medicine-detail {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
