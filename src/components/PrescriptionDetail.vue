<script setup lang="ts">
import { computed } from 'vue'
import {
  User, OfficeBuilding, UserFilled, Calendar, Goods, Clock, Phone, Location,
  Edit, Document, Male, Female, Link,
} from '@element-plus/icons-vue'
import type { Prescription } from '@/types/prescription'
import { PRESCRIPTION_CATEGORY_LABELS, PRESCRIPTION_STATUS_LABELS } from '@/types/prescription'
import type { Medicine } from '@/types/medicine'
import { getPrescriptionExpiryStatus, formatPrescriptionDaysLeft } from '@/utils/ocr'

interface Props {
  visible: boolean
  prescription: Prescription | null
  medicineList: Medicine[]
}

const props = withDefaults(defineProps<Props>(), {
  prescription: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'edit', prescription: Prescription): void
}>()

const expiryInfo = computed(() => {
  if (!props.prescription) return { status: 'active' as const, daysLeft: 0 }
  return getPrescriptionExpiryStatus(props.prescription.expiryDate)
})

const statusLabel = computed(() => {
  return PRESCRIPTION_STATUS_LABELS[expiryInfo.value.status]
})

const categoryLabel = computed(() => {
  if (!props.prescription) return ''
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
  if (!props.prescription) return { bg: '#f5f5f4', text: '#57534e' }
  const colorMap = {
    outpatient: { bg: '#eff6ff', text: '#2563eb' },
    chronic: { bg: '#f0fdf4', text: '#16a34a' },
    emergency: { bg: '#fef2f2', text: '#dc2626' },
    other: { bg: '#f5f5f4', text: '#57534e' },
  }
  return colorMap[props.prescription.category]
})

const getLinkedMedicine = (medicineId?: string) => {
  if (!medicineId) return null
  return props.medicineList.find((m) => m.id === medicineId) || null
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleEdit = () => {
  if (props.prescription) {
    emit('edit', props.prescription)
  }
}

const handleImagePreview = () => {
  if (props.prescription?.image) {
    window.open(props.prescription.image, '_blank')
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="处方详情"
    width="720px"
    @update:model-value="handleClose"
    class="prescription-detail-dialog"
  >
    <div v-if="prescription" class="prescription-detail">
      <div v-if="prescription.image" class="prescription-detail__image-wrap">
        <img
          :src="prescription.image"
          :alt="prescription.patientName + '处方单'"
          class="prescription-detail__image"
          @click="handleImagePreview"
        />
        <div class="prescription-detail__image-hint">
          点击图片查看大图
        </div>
      </div>

      <div class="prescription-detail__header">
        <div
          class="prescription-detail__icon"
          :style="{ backgroundColor: categoryColor.bg, color: categoryColor.text }"
        >
          <el-icon :size="36">
            <Document />
          </el-icon>
        </div>
        <div class="prescription-detail__title-wrap">
          <div class="prescription-detail__title-row">
            <h2 class="prescription-detail__patient">{{ prescription.patientName }}</h2>
            <span
              class="prescription-detail__gender-age"
              v-if="prescription.patientGender || prescription.patientAge"
            >
              <el-icon v-if="prescription.patientGender === 'male'"><Male /></el-icon>
              <el-icon v-else-if="prescription.patientGender === 'female'"><Female /></el-icon>
              <span v-if="prescription.patientAge">{{ prescription.patientAge }}岁</span>
            </span>
          </div>
          <div class="prescription-detail__labels">
            <span
              class="prescription-detail__category"
              :style="{ backgroundColor: categoryColor.bg, color: categoryColor.text }"
            >
              {{ categoryLabel }}
            </span>
            <span v-if="prescription.code" class="prescription-detail__code">
              处方编号：{{ prescription.code }}
            </span>
          </div>
        </div>
      </div>

      <div class="prescription-detail__diagnosis">
        <div class="prescription-detail__diagnosis-label">临床诊断</div>
        <div class="prescription-detail__diagnosis-content">{{ prescription.diagnosis }}</div>
      </div>

      <div class="prescription-detail__expiry">
        <div
          class="prescription-detail__expiry-badge"
          :style="{
            backgroundColor: statusColor.bg,
            color: statusColor.text,
          }"
          :class="{ breathe: expiryInfo.status === 'warning' }"
        >
          <span
            class="prescription-detail__expiry-dot"
            :style="{ backgroundColor: statusColor.text }"
          />
          {{ statusLabel }}
        </div>
        <div class="prescription-detail__expiry-info">
          <el-icon class="prescription-detail__expiry-icon" :style="{ color: statusColor.text }">
            <Clock />
          </el-icon>
          <span class="prescription-detail__expiry-label">有效期至 {{ prescription.expiryDate }}</span>
          <span
            class="prescription-detail__expiry-days"
            :style="{ color: statusColor.text }"
          >
            {{ formatPrescriptionDaysLeft(expiryInfo.daysLeft) }}
          </span>
        </div>
      </div>

      <div class="prescription-detail__section">
        <h3 class="prescription-detail__section-title">医生信息</h3>
        <div class="prescription-detail__grid">
          <div class="prescription-detail__item">
            <div class="prescription-detail__item-label">
              <el-icon><UserFilled /></el-icon>
              医生姓名
            </div>
            <div class="prescription-detail__item-value">{{ prescription.doctor.name }}</div>
          </div>
          <div class="prescription-detail__item">
            <div class="prescription-detail__item-label">
              <el-icon><OfficeBuilding /></el-icon>
              所属科室
            </div>
            <div class="prescription-detail__item-value">{{ prescription.doctor.department }}</div>
          </div>
          <div class="prescription-detail__item" v-if="prescription.doctor.title">
            <div class="prescription-detail__item-label">职称</div>
            <div class="prescription-detail__item-value">{{ prescription.doctor.title }}</div>
          </div>
          <div class="prescription-detail__item" v-if="prescription.doctor.phone">
            <div class="prescription-detail__item-label">
              <el-icon><Phone /></el-icon>
              联系电话
            </div>
            <div class="prescription-detail__item-value">{{ prescription.doctor.phone }}</div>
          </div>
        </div>
      </div>

      <div class="prescription-detail__section">
        <h3 class="prescription-detail__section-title">医院信息</h3>
        <div class="prescription-detail__grid">
          <div class="prescription-detail__item">
            <div class="prescription-detail__item-label">
              <el-icon><OfficeBuilding /></el-icon>
              医院名称
            </div>
            <div class="prescription-detail__item-value">{{ prescription.hospital.name }}</div>
          </div>
          <div class="prescription-detail__item" v-if="prescription.hospital.level">
            <div class="prescription-detail__item-label">医院等级</div>
            <div class="prescription-detail__item-value">{{ prescription.hospital.level }}</div>
          </div>
          <div class="prescription-detail__item" v-if="prescription.hospital.phone">
            <div class="prescription-detail__item-label">
              <el-icon><Phone /></el-icon>
              医院电话
            </div>
            <div class="prescription-detail__item-value">{{ prescription.hospital.phone }}</div>
          </div>
          <div class="prescription-detail__item" v-if="prescription.hospital.address">
            <div class="prescription-detail__item-label">
              <el-icon><Location /></el-icon>
              医院地址
            </div>
            <div class="prescription-detail__item-value">{{ prescription.hospital.address }}</div>
          </div>
        </div>
      </div>

      <div class="prescription-detail__section">
        <h3 class="prescription-detail__section-title">
          <el-icon><Goods /></el-icon>
          处方药品（共 {{ prescription.medicines.length }} 种）
        </h3>
        <div class="prescription-detail__medicines">
          <div
            v-for="(medicine, index) in prescription.medicines"
            :key="index"
            class="prescription-detail__medicine-card"
          >
            <div class="prescription-detail__medicine-header">
              <span class="prescription-detail__medicine-number">{{ index + 1 }}</span>
              <div class="prescription-detail__medicine-info">
                <div class="prescription-detail__medicine-name">
                  {{ medicine.name }}
                  <el-tag
                    v-if="getLinkedMedicine(medicine.medicineId)"
                    type="success"
                    size="small"
                    effect="light"
                    class="prescription-detail__linked-tag"
                  >
                    <el-icon><Link /></el-icon>
                    已关联药品库
                  </el-tag>
                </div>
                <div class="prescription-detail__medicine-spec">{{ medicine.specification }}</div>
              </div>
            </div>
            <div class="prescription-detail__medicine-details">
              <div class="prescription-detail__medicine-detail-item">
                <span class="prescription-detail__medicine-detail-label">用量</span>
                <span class="prescription-detail__medicine-detail-value">{{ medicine.dosage }}</span>
              </div>
              <div class="prescription-detail__medicine-detail-item">
                <span class="prescription-detail__medicine-detail-label">频次</span>
                <span class="prescription-detail__medicine-detail-value">{{ medicine.frequency }}</span>
              </div>
              <div class="prescription-detail__medicine-detail-item">
                <span class="prescription-detail__medicine-detail-label">数量</span>
                <span class="prescription-detail__medicine-detail-value">{{ medicine.quantity }} 盒/瓶</span>
              </div>
              <div class="prescription-detail__medicine-detail-item">
                <span class="prescription-detail__medicine-detail-label">服用天数</span>
                <span class="prescription-detail__medicine-detail-value">{{ medicine.days }} 天</span>
              </div>
            </div>
            <div v-if="medicine.notes" class="prescription-detail__medicine-notes">
              <span class="prescription-detail__medicine-notes-label">备注：</span>
              {{ medicine.notes }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="prescription.notes" class="prescription-detail__section">
        <h3 class="prescription-detail__section-title">医嘱备注</h3>
        <div class="prescription-detail__notes">
          {{ prescription.notes }}
        </div>
      </div>

      <div class="prescription-detail__meta">
        <div class="prescription-detail__meta-item">
          <el-icon><Calendar /></el-icon>
          开具日期：{{ prescription.issueDate }}
        </div>
        <div class="prescription-detail__meta-item">
          创建时间：{{ prescription.createdAt }}
        </div>
        <div
          v-if="prescription.updatedAt !== prescription.createdAt"
          class="prescription-detail__meta-item"
        >
          更新时间：{{ prescription.updatedAt }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit">
        <el-icon><Edit /></el-icon>
        编辑处方
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.prescription-detail-dialog {
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

.prescription-detail {
  &__image-wrap {
    margin: -20px -24px 20px;
    max-height: 300px;
    overflow: hidden;
    background: var(--color-bg);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    position: relative;
    cursor: pointer;
  }

  &__image {
    width: 100%;
    height: 300px;
    object-fit: contain;
    transition: transform var(--transition-base);
  }

  &__image-wrap:hover &__image {
    transform: scale(1.02);
  }

  &__image-hint {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
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

  &__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  &__patient {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__gender-age {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--color-text-secondary);
    background: var(--color-bg);
    padding: 4px 12px;
    border-radius: 12px;

    .el-icon {
      font-size: 16px;
    }
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

  &__code {
    font-size: 13px;
    color: var(--color-text-secondary);
    background: var(--color-bg);
    padding: 4px 12px;
    border-radius: 12px;
  }

  &__diagnosis {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-primary);
  }

  &__diagnosis-label {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
  }

  &__diagnosis-content {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__expiry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px 20px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
    gap: 12px;
  }

  &__expiry-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 600;
  }

  &__expiry-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__expiry-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__expiry-icon {
    flex-shrink: 0;
  }

  &__expiry-label {
    font-size: 14px;
    color: var(--color-text-secondary);
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
    display: flex;
    align-items: center;
    gap: 8px;
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

  &__medicines {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__medicine-card {
    padding: 16px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-light);
  }

  &__medicine-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--color-border-light);
  }

  &__medicine-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__medicine-info {
    flex: 1;
  }

  &__medicine-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__linked-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__medicine-spec {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__medicine-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 16px;
  }

  &__medicine-detail-item {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 13px;
  }

  &__medicine-detail-label {
    color: var(--color-text-secondary);
  }

  &__medicine-detail-value {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  &__medicine-notes {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--color-border-light);
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__medicine-notes-label {
    color: var(--color-primary);
    font-weight: 500;
  }

  &__notes {
    padding: 16px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.8;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding-top: 16px;
    font-size: 12px;
    color: var(--color-text-light);
    border-top: 1px dashed var(--color-border-light);
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
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

@media (max-width: 600px) {
  .prescription-detail {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__medicine-details {
      grid-template-columns: 1fr;
    }
  }
}
</style>
