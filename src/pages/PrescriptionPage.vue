<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Plus, RefreshLeft, ArrowLeft, Notification, Document,
  Filter, Calendar, Warning, CircleCheck, CircleClose,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePrescription } from '@/composables/usePrescription'
import { useMedicine } from '@/composables/useMedicine'
import { useTag } from '@/composables/useTag'
import type { Prescription } from '@/types/prescription'
import {
  PRESCRIPTION_CATEGORY_LABELS,
  PRESCRIPTION_STATUS_LABELS,
} from '@/types/prescription'
import type { PrescriptionCategory, PrescriptionStatus } from '@/types/prescription'
import { formatPrescriptionDaysLeft } from '@/utils/ocr'
import DisclaimerBanner from '@/components/DisclaimerBanner.vue'
import PrescriptionCard from '@/components/PrescriptionCard.vue'
import PrescriptionForm from '@/components/PrescriptionForm.vue'
import PrescriptionDetail from '@/components/PrescriptionDetail.vue'
import StatsCard from '@/components/StatsCard.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()

const {
  prescriptionList,
  filteredPrescriptionList,
  filterOptions,
  statistics,
  expiringSoon,
  loadPrescriptionList,
  addPrescriptionItem,
  updatePrescriptionItem,
  deletePrescriptionItem,
  setFilter,
  resetFilter,
  checkExpiringReminders,
} = usePrescription()

const { medicineList, loadMedicineList } = useMedicine()
const { tagList, loadTagList } = useTag()

const keyword = ref('')
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const showFilterDrawer = ref(false)
const editingPrescription = ref<Prescription | null>(null)
const viewingPrescription = ref<Prescription | null>(null)
const showExpiryReminder = ref(false)

const categoryOptions = [
  { value: '', label: '全部分类' },
  ...Object.entries(PRESCRIPTION_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as PrescriptionCategory,
    label,
  })),
]

const statusOptions = [
  { value: '', label: '全部状态' },
  ...Object.entries(PRESCRIPTION_STATUS_LABELS).map(([value, label]) => ({
    value: value as PrescriptionStatus,
    label,
  })),
]

const expiryReminders = computed(() => {
  return checkExpiringReminders()
})

onMounted(() => {
  loadPrescriptionList()
  loadMedicineList()
  loadTagList()

  setTimeout(() => {
    if (expiryReminders.value.length > 0) {
      showExpiryReminder.value = true
    }
  }, 1000)
})

const handleSearch = () => {
  setFilter({ keyword: keyword.value })
}

const handleReset = () => {
  keyword.value = ''
  resetFilter()
}

const handleFilterChange = () => {
  setFilter({ ...filterOptions.value })
}

const handleAddPrescription = () => {
  editingPrescription.value = null
  showFormDialog.value = true
}

const handleEditPrescription = (prescription: Prescription) => {
  editingPrescription.value = prescription
  showDetailDialog.value = false
  showFormDialog.value = true
}

const handleViewPrescription = (prescription: Prescription) => {
  viewingPrescription.value = prescription
  showDetailDialog.value = true
}

const handleDeletePrescription = async (prescription: Prescription) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${prescription.patientName} 的处方吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    deletePrescriptionItem(prescription.id)
    ElMessage.success('处方删除成功')
  } catch {
    // User cancelled
  }
}

const handleSavePrescription = (data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
  addPrescriptionItem(data)
  showFormDialog.value = false
}

const handleUpdatePrescription = (id: string, data: Partial<Prescription>) => {
  updatePrescriptionItem(id, data)
  showFormDialog.value = false
}

const handleCloseExpiryReminder = () => {
  showExpiryReminder.value = false
}

const handleGoToExpiring = () => {
  setFilter({ status: 'warning' })
  showExpiryReminder.value = false
}

const goBack = () => {
  router.push('/')
}

const getCategoryColor = (category: PrescriptionCategory) => {
  const colorMap = {
    outpatient: { bg: '#eff6ff', text: '#2563eb' },
    chronic: { bg: '#f0fdf4', text: '#16a34a' },
    emergency: { bg: '#fef2f2', text: '#dc2626' },
    other: { bg: '#f5f5f4', text: '#57534e' },
  }
  return colorMap[category] || colorMap.other
}
</script>

<template>
  <div class="prescription-page">
    <header class="prescription-page__header">
      <div class="prescription-page__header-content">
        <button class="prescription-page__back-btn" @click="goBack">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <div class="prescription-page__title-wrap">
          <h1 class="prescription-page__title">
            <el-icon :size="28"><Document /></el-icon>
            处方管理
          </h1>
          <p class="prescription-page__subtitle">
            拍照上传处方，智能识别信息，有效期提醒，分类管理
          </p>
        </div>
        <el-button type="primary" :icon="Plus" class="prescription-page__add-btn" @click="handleAddPrescription">
          新增处方
        </el-button>
      </div>
    </header>

    <main class="prescription-page__main">
      <DisclaimerBanner />

      <div v-if="expiryReminders.length > 0" class="prescription-page__reminder-bar" @click="handleGoToExpiring">
        <div class="prescription-page__reminder-content">
          <el-icon class="prescription-page__reminder-icon" :size="20">
            <Notification />
          </el-icon>
          <span class="prescription-page__reminder-text">
            有 <strong>{{ expiryReminders.length }}</strong> 张处方即将过期，请及时购药
          </span>
        </div>
        <el-button
          size="small"
          type="warning"
          class="prescription-page__reminder-btn"
          @click.stop="handleGoToExpiring"
        >
          立即查看
        </el-button>
      </div>

      <div class="prescription-page__stats">
        <div class="prescription-page__stats-grid">
          <StatsCard title="处方总数" :value="statistics.total" type="total" />
          <StatsCard title="有效处方" :value="statistics.active" type="normal" />
          <StatsCard title="即将过期" :value="statistics.warning" type="warning" />
          <StatsCard title="已过期" :value="statistics.expired" type="expired" />
        </div>
      </div>

      <div v-if="expiringSoon.length > 0" class="prescription-page__expiring-section">
        <div class="prescription-page__section-header">
          <h3 class="prescription-page__section-title">
            <el-icon><Warning /></el-icon>
            即将过期提醒
          </h3>
          <el-button type="primary" text size="small" @click="handleGoToExpiring">
            查看全部
          </el-button>
        </div>
        <div class="prescription-page__expiring-list">
          <div
            v-for="reminder in expiryReminders.slice(0, 3)"
            :key="reminder.id"
            class="prescription-page__expiring-item"
          >
            <div class="prescription-page__expiring-info">
              <span class="prescription-page__expiring-patient">{{ reminder.patientName }}</span>
              <span class="prescription-page__expiring-diagnosis">{{ reminder.diagnosis }}</span>
            </div>
            <div class="prescription-page__expiring-status">
              <span class="prescription-page__expiring-date">
                有效期至 {{ reminder.expiryDate }}
              </span>
              <span class="prescription-page__expiring-days">
                {{ formatPrescriptionDaysLeft(reminder.daysLeft) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="prescription-page__filter-section">
        <div class="prescription-page__search-bar">
          <div class="prescription-page__search-input-wrap">
            <el-icon class="prescription-page__search-icon"><Search /></el-icon>
            <el-input
              v-model="keyword"
              placeholder="搜索患者姓名、医生、医院、诊断或药品"
              class="prescription-page__search-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleReset"
            />
            <el-button type="primary" class="prescription-page__search-btn" @click="handleSearch">
              搜索
            </el-button>
          </div>
          <el-button
            class="prescription-page__filter-btn"
            @click="showFilterDrawer = true"
          >
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>

        <div class="prescription-page__quick-filters">
          <div
            class="prescription-page__quick-filter"
            :class="{ 'is-active': filterOptions.status === '' }"
            @click="setFilter({ status: '' })"
          >
            <el-icon><Document /></el-icon>
            全部
          </div>
          <div
            class="prescription-page__quick-filter"
            :class="{ 'is-active': filterOptions.status === 'active' }"
            @click="setFilter({ status: 'active' })"
          >
            <el-icon><CircleCheck /></el-icon>
            有效
          </div>
          <div
            class="prescription-page__quick-filter"
            :class="{ 'is-active': filterOptions.status === 'warning' }"
            @click="setFilter({ status: 'warning' })"
          >
            <el-icon><Warning /></el-icon>
            即将过期
          </div>
          <div
            class="prescription-page__quick-filter"
            :class="{ 'is-active': filterOptions.status === 'expired' }"
            @click="setFilter({ status: 'expired' })"
          >
            <el-icon><CircleClose /></el-icon>
            已过期
          </div>
        </div>
      </div>

      <div class="prescription-page__category-stats">
        <div
          v-for="(count, category) in statistics.categories"
          :key="category"
          class="prescription-page__category-stat"
          :style="{
            backgroundColor: getCategoryColor(category as PrescriptionCategory).bg,
            color: getCategoryColor(category as PrescriptionCategory).text,
          }"
          @click="setFilter({ category: category as PrescriptionCategory })"
        >
          <span class="prescription-page__category-label">
            {{ PRESCRIPTION_CATEGORY_LABELS[category as PrescriptionCategory] }}
          </span>
          <span class="prescription-page__category-count">{{ count }}</span>
        </div>
      </div>

      <div class="prescription-page__results-info">
        共找到 <strong>{{ filteredPrescriptionList.length }}</strong> 张处方
      </div>

      <div v-if="filteredPrescriptionList.length > 0" class="prescription-page__list">
        <PrescriptionCard
          v-for="(prescription, index) in filteredPrescriptionList"
          :key="prescription.id"
          :prescription="prescription"
          :index="index"
          @view="handleViewPrescription"
          @edit="handleEditPrescription"
          @delete="handleDeletePrescription"
        />
      </div>

      <Empty
        v-else
        description="暂无处方记录，点击右上角按钮添加第一张处方"
        :show-action="true"
        action-text="新增处方"
        @action="handleAddPrescription"
      />
    </main>

    <el-drawer
      v-model="showFilterDrawer"
      title="筛选条件"
      direction="rtl"
      size="320px"
      class="prescription-page__filter-drawer"
    >
      <div class="prescription-page__filter-content">
        <el-form label-position="top">
          <el-form-item label="处方分类">
            <el-select
              v-model="filterOptions.category"
              placeholder="请选择分类"
              style="width: 100%"
              @change="handleFilterChange"
            >
              <el-option
                v-for="option in categoryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="处方状态">
            <el-select
              v-model="filterOptions.status"
              placeholder="请选择状态"
              style="width: 100%"
              @change="handleFilterChange"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="开具日期范围">
            <el-date-picker
              v-model="filterOptions.startDate"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%; margin-bottom: 10px"
              @change="handleFilterChange"
            />
            <el-date-picker
              v-model="filterOptions.endDate"
              type="date"
              placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              @change="handleFilterChange"
            />
          </el-form-item>
        </el-form>

        <div class="prescription-page__filter-actions">
          <el-button style="width: 100%" @click="handleReset">
            重置筛选
          </el-button>
        </div>
      </div>
    </el-drawer>

    <PrescriptionForm
      v-model:visible="showFormDialog"
      :prescription="editingPrescription"
      :medicine-list="medicineList"
      @save="handleSavePrescription"
      @update="handleUpdatePrescription"
    />

    <PrescriptionDetail
      v-model:visible="showDetailDialog"
      :prescription="viewingPrescription"
      :medicine-list="medicineList"
      @edit="handleEditPrescription"
    />

    <el-dialog
      v-model="showExpiryReminder"
      title="处方到期提醒"
      width="400px"
      class="prescription-page__reminder-dialog"
    >
      <div class="prescription-page__reminder-dialog-content">
        <div class="prescription-page__reminder-dialog-icon">
          <el-icon :size="48" color="#f59e0b"><Notification /></el-icon>
        </div>
        <p class="prescription-page__reminder-dialog-text">
          您有 <strong>{{ expiryReminders.length }}</strong> 张处方即将过期，
          建议及时购药避免影响治疗。
        </p>
        <div class="prescription-page__reminder-dialog-list">
          <div
            v-for="reminder in expiryReminders.slice(0, 3)"
            :key="reminder.id"
            class="prescription-page__reminder-dialog-item"
          >
            <span>{{ reminder.patientName }} - {{ reminder.diagnosis }}</span>
            <span class="prescription-page__reminder-dialog-days">
              {{ formatPrescriptionDaysLeft(reminder.daysLeft) }}
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCloseExpiryReminder">稍后提醒</el-button>
        <el-button type="primary" @click="handleGoToExpiring">
          立即查看
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.prescription-page {
  min-height: 100vh;
  background: var(--color-bg-page);

  &__header {
    background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
    color: #fff;
    padding: 24px 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-md);
  }

  &__header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__back-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-base);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &__title-wrap {
    flex: 1;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__subtitle {
    font-size: 13px;
    opacity: 0.9;
    margin: 0;
  }

  &__add-btn {
    background: #fff;
    color: var(--color-primary);
    border: none;
    font-weight: 500;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
      color: var(--color-primary);
    }
  }

  &__main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  &__reminder-bar {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1px solid #fcd34d;
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-sm);
    }
  }

  &__reminder-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__reminder-icon {
    color: #f59e0b;
  }

  &__reminder-text {
    font-size: 14px;
    color: #92400e;

    strong {
      color: #d97706;
      font-size: 16px;
    }
  }

  &__stats {
    margin-bottom: 24px;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  &__expiring-section {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;

    .el-icon {
      color: #f59e0b;
    }
  }

  &__expiring-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__expiring-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    border-left: 3px solid #f59e0b;
  }

  &__expiring-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__expiring-patient {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__expiring-diagnosis {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__expiring-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  &__expiring-date {
    font-size: 12px;
    color: var(--color-text-light);
  }

  &__expiring-days {
    font-size: 13px;
    font-weight: 600;
    color: #d97706;
  }

  &__filter-section {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
  }

  &__search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  &__search-icon {
    position: absolute;
    left: 12px;
    color: var(--color-text-light);
    z-index: 1;
  }

  &__search-input {
    padding-left: 36px;

    :deep(.el-input__wrapper) {
      border-radius: var(--radius-md);
    }
  }

  &__search-btn {
    border-radius: var(--radius-md);
  }

  &__filter-btn {
    border-radius: var(--radius-md);
  }

  &__quick-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__quick-filter {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-base);
    border: 1px solid transparent;

    &:hover {
      background: var(--color-primary) + '10';
      color: var(--color-primary);
    }

    &.is-active {
      background: var(--color-primary) + '15';
      color: var(--color-primary);
      border-color: var(--color-primary) + '40';
    }
  }

  &__category-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  &__category-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
  }

  &__category-label {
    font-size: 13px;
    font-weight: 500;
  }

  &__category-count {
    font-size: 18px;
    font-weight: 700;
  }

  &__results-info {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 16px;

    strong {
      color: var(--color-primary);
      font-size: 16px;
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  &__filter-content {
    padding: 16px 0;
  }

  &__filter-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-light);
  }

  &__reminder-dialog-content {
    text-align: center;
    padding: 20px 0;
  }

  &__reminder-dialog-icon {
    margin-bottom: 16px;
  }

  &__reminder-dialog-text {
    font-size: 15px;
    color: var(--color-text-secondary);
    margin: 0 0 20px 0;

    strong {
      color: #d97706;
      font-size: 20px;
    }
  }

  &__reminder-dialog-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  &__reminder-dialog-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__reminder-dialog-days {
    font-weight: 600;
    color: #d97706;
  }
}

@media (max-width: 768px) {
  .prescription-page {
    &__stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    &__category-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    &__search-bar {
      flex-direction: column;
      align-items: stretch;

      > * {
        width: 100%;
      }
    }

    &__list {
      grid-template-columns: 1fr;
    }

    &__header-content {
      flex-wrap: wrap;
    }

    &__title-wrap {
      order: 3;
      width: 100%;
      margin-top: 12px;
    }
  }
}
</style>
