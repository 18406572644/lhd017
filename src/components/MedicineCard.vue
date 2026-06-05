<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Delete, View, ColdDrink, HotWater, Goblet, DataAnalysis, FirstAidKit, Cherry, Apple, Box, Location, Calendar, Goods } from '@element-plus/icons-vue'
import type { Medicine, ExpiryStatus } from '@/types/medicine'
import { CATEGORY_LIST, EXPIRY_STATUS_INFO } from '@/types/medicine'
import { calculateExpiryStatus, formatDaysLeft } from '@/utils/date'

interface Props {
  medicine: Medicine
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
})

const emit = defineEmits<{
  (e: 'view', medicine: Medicine): void
  (e: 'edit', medicine: Medicine): void
  (e: 'delete', medicine: Medicine): void
}>()

const expiryInfo = computed(() => {
  return calculateExpiryStatus(props.medicine.expiryDate)
})

const statusInfo = computed(() => {
  return EXPIRY_STATUS_INFO[expiryInfo.value.status]
})

const categoryInfo = computed(() => {
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

const cardAnimationDelay = computed(() => {
  return `${props.index * 0.05}s`
})

const handleView = () => {
  emit('view', props.medicine)
}

const handleEdit = () => {
  emit('edit', props.medicine)
}

const handleDelete = () => {
  emit('delete', props.medicine)
}
</script>

<template>
  <div
    class="medicine-card fade-in-up"
    :style="{ animationDelay: cardAnimationDelay }"
    :class="{ 'medicine-card--expired': expiryInfo.status === 'expired' }"
  >
    <div
      class="medicine-card__status-bar"
      :style="{ backgroundColor: statusInfo.color }"
      :class="{ breathe: expiryInfo.status === 'warning' }"
    />
    
    <div class="medicine-card__content">
      <div v-if="medicine.image" class="medicine-card__image-wrap">
        <img :src="medicine.image" :alt="medicine.name" class="medicine-card__image" />
      </div>

      <div class="medicine-card__header">
        <div
          v-if="!medicine.image"
          class="medicine-card__icon"
          :style="{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }"
        >
          <el-icon :size="24">
            <component :is="iconComponent" />
          </el-icon>
        </div>
        <div class="medicine-card__title-wrap">
          <h3 class="medicine-card__title" :title="medicine.name">{{ medicine.name }}</h3>
          <span
            class="medicine-card__category"
            :style="{ backgroundColor: categoryInfo.color + '15', color: categoryInfo.color }"
          >
            {{ categoryInfo.label }}
          </span>
        </div>
      </div>

      <div class="medicine-card__info">
        <div class="medicine-card__info-item">
          <el-icon class="medicine-card__info-icon"><Goods /></el-icon>
          <span class="medicine-card__info-label">规格</span>
          <span class="medicine-card__info-value">{{ medicine.specification }}</span>
        </div>
        <div class="medicine-card__info-item">
          <el-icon class="medicine-card__info-icon"><Location /></el-icon>
          <span class="medicine-card__info-label">位置</span>
          <span class="medicine-card__info-value" :title="medicine.storageLocation">
            {{ medicine.storageLocation }}
          </span>
        </div>
        <div class="medicine-card__info-item">
          <el-icon class="medicine-card__info-icon"><Calendar /></el-icon>
          <span class="medicine-card__info-label">有效期至</span>
          <span class="medicine-card__info-value">{{ medicine.expiryDate }}</span>
        </div>
      </div>

      <div class="medicine-card__expiry">
        <div
          class="medicine-card__expiry-badge"
          :style="{
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.color,
          }"
          :class="{ breathe: expiryInfo.status === 'warning' }"
        >
          <span
            class="medicine-card__expiry-dot"
            :style="{ backgroundColor: statusInfo.color }"
          />
          {{ statusInfo.label }}
        </div>
        <span
          class="medicine-card__expiry-days"
          :style="{ color: statusInfo.color }"
        >
          {{ formatDaysLeft(expiryInfo.daysLeft) }}
        </span>
      </div>

      <div class="medicine-card__quantity">
        数量：<span class="medicine-card__quantity-num">{{ medicine.quantity }}</span> 盒/瓶
      </div>

      <div class="medicine-card__symptoms" :title="medicine.symptoms">
        {{ medicine.symptoms || '暂无描述' }}
      </div>

      <div class="medicine-card__actions">
        <el-button
          type="primary"
          size="small"
          class="medicine-card__btn medicine-card__btn--view"
          @click="handleView"
        >
          <el-icon><View /></el-icon>
          详情
        </el-button>
        <el-button
          size="small"
          class="medicine-card__btn"
          @click="handleEdit"
        >
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button
          type="danger"
          size="small"
          class="medicine-card__btn"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.medicine-card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
  }

  &--expired {
    opacity: 0.85;
  }

  &__status-bar {
    height: 4px;
    width: 100%;
    flex-shrink: 0;
  }

  &__content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 12px;
  }

  &__image-wrap {
    margin: -20px -20px 0;
    height: 160px;
    overflow: hidden;
    background: var(--color-bg);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-base);
  }

  &:hover &__image {
    transform: scale(1.05);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title-wrap {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 6px 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  &__category {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-light);
    border-bottom: 1px solid var(--color-border-light);
  }

  &__info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  &__info-icon {
    color: var(--color-text-light);
    font-size: 14px;
    flex-shrink: 0;
  }

  &__info-label {
    color: var(--color-text-secondary);
    min-width: 60px;
  }

  &__info-value {
    color: var(--color-text-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__expiry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__expiry-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__expiry-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__expiry-days {
    font-size: 12px;
    font-weight: 500;
  }

  &__quantity {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__quantity-num {
    color: var(--color-primary);
    font-weight: 600;
  }

  &__symptoms {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    flex: 1;
  }

  &__actions {
    display: flex;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border-light);
  }

  &__btn {
    flex: 1;
    border-radius: var(--radius-sm);
    font-size: 12px;

    &--view {
      background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
      border: none;
    }
  }
}
</style>
