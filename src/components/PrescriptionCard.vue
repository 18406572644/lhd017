<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Delete, View, User, OfficeBuilding, UserFilled, Calendar, Goods, Clock, Notification, Document } from '@element-plus/icons-vue'
import type { Prescription } from '@/types/prescription'
import { PRESCRIPTION_CATEGORY_LABELS, PRESCRIPTION_STATUS_LABELS } from '@/types/prescription'
import { getPrescriptionExpiryStatus, formatPrescriptionDaysLeft } from '@/utils/ocr'

const props = withDefaults(defineProps<{
  prescription: Prescription
  index?: number
}>(), {
  index: 0,
})

const emit = defineEmits<{
  (e: 'view', prescription: Prescription): void
  (e: 'edit', prescription: Prescription): void
  (e: 'delete', prescription: Prescription): void
}>()

const expiryInfo = computed(() => {
  return getPrescriptionExpiryStatus(props.prescription.expiryDate)
})

const statusLabel = computed(() => {
  return PRESCRIPTION_STATUS_LABELS[expiryInfo.value.status]
})

const categoryLabel = computed(() => {
  return PRESCRIPTION_CATEGORY_LABELS[props.prescription.category]
})

const statusColor = computed(() => {
  const colorMap = {
    active: { bg: '#ecfdf5', text: '#059669', bar: '#10b981' },
    warning: { bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' },
    expired: { bg: '#fef2f2', text: '#dc2626', bar: '#ef4444' },
  }
  return colorMap[expiryInfo.value.status]
})

const categoryColor = computed(() => {
  const colorMap = {
    outpatient: { bg: '#eff6ff', text: '#2563eb' },
    chronic: { bg: '#f0fdf4', text: '#16a34a' },
    emergency: { bg: '#fef2f2', text: '#dc2626' },
    other: { bg: '#f5f5f4', text: '#57534e' },
  }
  return colorMap[props.prescription.category]
})

const cardAnimationDelay = computed(() => {
  return `${props.index * 0.05}s`
})

const handleView = () => {
  emit('view', props.prescription)
}

const handleEdit = () => {
  emit('edit', props.prescription)
}

const handleDelete = () => {
  emit('delete', props.prescription)
}
</script>

<template>
  <div
    class="prescription-card fade-in-up"
    :style="{ animationDelay: cardAnimationDelay }"
    :class="{ 'prescription-card--expired': expiryInfo.status === 'expired' }"
  >
    <div
      class="prescription-card__status-bar"
      :style="{ backgroundColor: statusColor.bar }"
      :class="{ breathe: expiryInfo.status === 'warning' }"
    />

    <div class="prescription-card__content">
      <div class="prescription-card__header">
        <div class="prescription-card__icon" :style="{ backgroundColor: categoryColor.bg + '', color: categoryColor.text }">
          <el-icon :size="24">
            <Document />
          </el-icon>
        </div>
        <div class="prescription-card__title-wrap">
          <div class="prescription-card__title-row">
            <h3 class="prescription-card__patient" :title="prescription.patientName">
              {{ prescription.patientName }}
            </h3>
            <span
              v-if="prescription.code"
              class="prescription-card__code"
            >
              {{ prescription.code }}
            </span>
          </div>
          <div class="prescription-card__category-row">
            <span
              class="prescription-card__category"
              :style="{ backgroundColor: categoryColor.bg, color: categoryColor.text }"
            >
              {{ categoryLabel }}
            </span>
            <span
              class="prescription-card__gender-age"
              v-if="prescription.patientGender || prescription.patientAge"
            >
              {{ prescription.patientGender === 'male' ? '男' : '女' }}
              <span v-if="prescription.patientAge">{{ prescription.patientAge }}岁</span>
            </span>
          </div>
        </div>
      </div>

      <div class="prescription-card__diagnosis" :title="prescription.diagnosis">
        {{ prescription.diagnosis }}
      </div>

      <div class="prescription-card__info">
        <div class="prescription-card__info-item">
          <el-icon class="prescription-card__info-icon"><UserFilled /></el-icon>
          <span class="prescription-card__info-label">医生</span>
          <span class="prescription-card__info-value">{{ prescription.doctor.name }}</span>
          <span class="prescription-card__info-dept">{{ prescription.doctor.department }}</span>
        </div>
        <div class="prescription-card__info-item">
          <el-icon class="prescription-card__info-icon"><OfficeBuilding /></el-icon>
          <span class="prescription-card__info-label">医院</span>
          <span class="prescription-card__info-value" :title="prescription.hospital.name">
            {{ prescription.hospital.name }}
          </span>
        </div>
        <div class="prescription-card__info-item">
          <el-icon class="prescription-card__info-icon"><Goods /></el-icon>
          <span class="prescription-card__info-label">药品</span>
          <span class="prescription-card__info-value">
            {{ prescription.medicines.length }} 种药品
          </span>
        </div>
        <div class="prescription-card__info-item">
          <el-icon class="prescription-card__info-icon"><Calendar /></el-icon>
          <span class="prescription-card__info-label">开具日期</span>
          <span class="prescription-card__info-value">{{ prescription.issueDate }}</span>
        </div>
      </div>

      <div class="prescription-card__expiry">
        <div class="prescription-card__expiry-left">
          <el-icon class="prescription-card__expiry-icon" :style="{ color: statusColor.text }">
            <Clock />
          </el-icon>
          <span class="prescription-card__expiry-label">有效期至</span>
          <span class="prescription-card__expiry-date">{{ prescription.expiryDate }}</span>
        </div>
        <div
          class="prescription-card__expiry-badge"
          :style="{
            backgroundColor: statusColor.bg,
            color: statusColor.text,
          }"
          :class="{ breathe: expiryInfo.status === 'warning' }"
        >
          <span
            class="prescription-card__expiry-dot"
            :style="{ backgroundColor: statusColor.text }"
          />
          {{ statusLabel }}
        </div>
      </div>

      <div class="prescription-card__days-left" :style="{ color: statusColor.text }">
        <el-icon v-if="expiryInfo.status === 'warning'" class="prescription-card__warning-icon">
          <Notification />
        </el-icon>
        {{ formatPrescriptionDaysLeft(expiryInfo.daysLeft) }}
      </div>

      <div class="prescription-card__medicines">
        <div
          v-for="(medicine, idx) in prescription.medicines.slice(0, 2)"
          :key="idx"
          class="prescription-card__medicine-item"
          :title="medicine.name"
        >
          <span class="prescription-card__medicine-dot" />
          {{ medicine.name }}
        </div>
        <span v-if="prescription.medicines.length > 2" class="prescription-card__medicine-more">
          +{{ prescription.medicines.length - 2 }} 种
        </span>
      </div>

      <div class="prescription-card__actions">
        <el-button
          type="primary"
          size="small"
          class="prescription-card__btn prescription-card__btn--view"
          @click="handleView"
        >
          <el-icon><View /></el-icon>
          详情
        </el-button>
        <el-button
          size="small"
          class="prescription-card__btn"
          @click="handleEdit"
        >
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button
          type="danger"
          size="small"
          class="prescription-card__btn"
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
.prescription-card {
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

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__patient {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  &__code {
    font-size: 12px;
    color: var(--color-text-light);
    background: var(--color-bg);
    padding: 2px 8px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  &__category-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__category {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__gender-age {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__diagnosis {
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
    padding: 8px 12px;
    background: var(--color-bg);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    gap: 6px;
    font-size: 12px;
  }

  &__info-icon {
    color: var(--color-text-light);
    font-size: 14px;
    flex-shrink: 0;
  }

  &__info-label {
    color: var(--color-text-secondary);
    min-width: 36px;
  }

  &__info-value {
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  &__info-dept {
    font-size: 11px;
    color: var(--color-text-light);
    background: var(--color-bg);
    padding: 1px 6px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  &__expiry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__expiry-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  &__expiry-icon {
    flex-shrink: 0;
  }

  &__expiry-label {
    color: var(--color-text-secondary);
  }

  &__expiry-date {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  &__expiry-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
  }

  &__expiry-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__days-left {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__warning-icon {
    font-size: 16px;
  }

  &__medicines {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 0;
    border-top: 1px dashed var(--color-border-light);
  }

  &__medicine-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--color-text-secondary);
    background: var(--color-bg);
    padding: 3px 8px;
    border-radius: 10px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__medicine-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-primary);
    flex-shrink: 0;
  }

  &__medicine-more {
    font-size: 11px;
    color: var(--color-primary);
    font-weight: 500;
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

@keyframes breathe {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.breathe {
  animation: breathe 2s ease-in-out infinite;
}
</style>
