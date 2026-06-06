<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  FirstAidKit, DataAnalysis, Document, Search,
  Warning, CircleCheck, Clock, Plus, ChatDotRound,
  TrendCharts,
} from '@element-plus/icons-vue'
import { useMedicine } from '@/composables/useMedicine'
import { usePrescription } from '@/composables/usePrescription'
import { useTag } from '@/composables/useTag'
import StatsCard from '@/components/StatsCard.vue'
import MedicineCard from '@/components/MedicineCard.vue'
import MedicineDetail from '@/components/MedicineDetail.vue'
import MedicineForm from '@/components/MedicineForm.vue'
import TagManager from '@/components/TagManager.vue'
import ExportDialog from '@/components/ExportDialog.vue'
import DisclaimerBanner from '@/components/DisclaimerBanner.vue'
import Empty from '@/components/Empty.vue'
import type { Medicine, ExportOptions } from '@/types/medicine'
import { MEDICINE_CATEGORY_LABELS, EXPIRY_STATUS_INFO } from '@/types/medicine'
import { calculateExpiryStatus } from '@/utils/date'
import { exportMedicineData } from '@/utils/export'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const {
  medicineList,
  filteredMedicineList,
  filterOptions,
  statistics,
  loadMedicineList,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  setFilter,
  resetFilter,
} = useMedicine()

const {
  statistics: prescriptionStats,
  expiringSoon,
  loadPrescriptionList,
  checkExpiringReminders,
} = usePrescription()

const { tagList, loadTagList, addTag, updateTag, deleteTag } = useTag()

const keyword = ref('')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showTagManager = ref(false)
const showExportDialog = ref(false)
const editingMedicine = ref<Medicine | null>(null)
const viewingMedicine = ref<Medicine | null>(null)

const expiryReminders = computed(() => {
  return checkExpiringReminders()
})

const recentMedicines = computed(() => {
  return [...medicineList.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

onMounted(() => {
  loadMedicineList()
  loadPrescriptionList()
  loadTagList()
})

const handleSearch = () => {
  setFilter({ keyword: keyword.value })
}

const handleReset = () => {
  keyword.value = ''
  resetFilter()
}

const handleCategoryFilter = (category: string) => {
  setFilter({ category: category as any })
}

const handleStatusFilter = (status: string) => {
  setFilter({ expiryStatus: status as any })
}

const handleAddMedicine = () => {
  editingMedicine.value = null
  showAddDialog.value = true
}

const handleEditMedicine = (medicine: Medicine) => {
  editingMedicine.value = medicine
  showDetailDialog.value = false
  showAddDialog.value = true
}

const handleViewMedicine = (medicine: Medicine) => {
  viewingMedicine.value = medicine
  showDetailDialog.value = true
}

const handleDeleteMedicine = async (medicine: Medicine) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除药品「${medicine.name}」吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    deleteMedicine(medicine.id)
    ElMessage.success('药品删除成功')
  } catch {
    // User cancelled
  }
}

const handleSaveMedicine = (data: any) => {
  addMedicine(data)
  showAddDialog.value = false
  ElMessage.success('药品添加成功')
}

const handleUpdateMedicine = (id: string, data: any) => {
  updateMedicine(id, data)
  showAddDialog.value = false
  ElMessage.success('药品信息更新成功')
}

const handleManageTags = () => {
  showTagManager.value = true
}

const handleSaveTag = (tag: any) => {
  if (tag.id) {
    updateTag(tag.id, tag)
    ElMessage.success('标签更新成功')
  } else {
    addTag(tag.name, tag.color)
    ElMessage.success('标签添加成功')
  }
}

const handleDeleteTag = (id: string) => {
  deleteTag(id)
  ElMessage.success('标签删除成功')
}

const handleExport = (options: ExportOptions) => {
  try {
    exportMedicineData(medicineList.value, filteredMedicineList.value, options, tagList.value)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home-page">
    <header class="home-page__header">
      <div class="home-page__header-content">
        <div class="home-page__title-wrap">
          <h1 class="home-page__title">
            <el-icon :size="32"><FirstAidKit /></el-icon>
            家庭医药管理
          </h1>
          <p class="home-page__subtitle">
            智能管理家庭药品，科学用药，守护家人健康
          </p>
        </div>
        <div class="home-page__nav">
          <el-button type="primary" :icon="Plus" @click="handleAddMedicine">
            添加药品
          </el-button>
        </div>
      </div>
    </header>

    <main class="home-page__main">
      <DisclaimerBanner />

      <div v-if="expiryReminders.length > 0" class="home-page__reminder-bar">
        <div class="home-page__reminder-content">
          <el-icon class="home-page__reminder-icon" :size="20">
            <Warning />
          </el-icon>
          <span class="home-page__reminder-text">
            有 <strong>{{ expiryReminders.length }}</strong> 张处方即将过期
          </span>
        </div>
        <el-button
          size="small"
          type="warning"
          @click="navigateTo('/prescription')"
        >
          查看详情
        </el-button>
      </div>

      <div class="home-page__quick-nav">
        <div
          class="home-page__nav-card"
          @click="navigateTo('/advice')"
        >
          <div class="home-page__nav-icon" style="background: linear-gradient(135deg, #4A90D9 0%, #7AB0E8 100%);">
            <el-icon :size="28"><ChatDotRound /></el-icon>
          </div>
          <div class="home-page__nav-info">
            <h3 class="home-page__nav-title">智能用药建议</h3>
            <p class="home-page__nav-desc">根据症状推荐合适药品</p>
          </div>
        </div>
        <div
          class="home-page__nav-card"
          @click="navigateTo('/prescription')"
        >
          <div class="home-page__nav-icon" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%);">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="home-page__nav-info">
            <h3 class="home-page__nav-title">处方管理</h3>
            <p class="home-page__nav-desc">拍照上传，智能识别</p>
            <div class="home-page__nav-stats">
              <span class="home-page__nav-stat">
                <CircleCheck />
                {{ prescriptionStats.active }} 有效
              </span>
              <span class="home-page__nav-stat home-page__nav-stat--warning">
                <Warning />
                {{ prescriptionStats.warning }} 即将过期
              </span>
            </div>
          </div>
        </div>
        <div
          class="home-page__nav-card"
          @click="navigateTo('/stats')"
        >
          <div class="home-page__nav-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);">
            <el-icon :size="28"><DataAnalysis /></el-icon>
          </div>
          <div class="home-page__nav-info">
            <h3 class="home-page__nav-title">数据统计</h3>
            <p class="home-page__nav-desc">多维度可视化分析</p>
            <div class="home-page__nav-stats">
              <span class="home-page__nav-stat">
                <TrendCharts />
                {{ statistics.total }} 种药品
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="home-page__stats">
        <div class="home-page__stats-grid">
          <StatsCard title="药品总数" :value="statistics.total" type="total" />
          <StatsCard title="正常效期" :value="statistics.total - statistics.warning - statistics.expired" type="normal" />
          <StatsCard title="即将过期" :value="statistics.warning" type="warning" />
          <StatsCard title="已过期" :value="statistics.expired" type="expired" />
        </div>
      </div>

      <div class="home-page__category-stats">
        <div
          v-for="(count, category) in statistics.categories"
          :key="category"
          class="home-page__category-stat"
          @click="handleCategoryFilter(category)"
        >
          <span class="home-page__category-label">
            {{ MEDICINE_CATEGORY_LABELS[category as keyof typeof MEDICINE_CATEGORY_LABELS] }}
          </span>
          <span class="home-page__category-count">{{ count }}</span>
        </div>
      </div>

      <div class="home-page__filter-section">
        <div class="home-page__search-bar">
          <div class="home-page__search-input-wrap">
            <el-icon class="home-page__search-icon"><Search /></el-icon>
            <el-input
              v-model="keyword"
              placeholder="搜索药品名称、症状、生产厂家..."
              class="home-page__search-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleReset"
            />
            <el-button type="primary" class="home-page__search-btn" @click="handleSearch">
              搜索
            </el-button>
          </div>
        </div>

        <div class="home-page__quick-filters">
          <div
            class="home-page__quick-filter"
            :class="{ 'is-active': filterOptions.expiryStatus === '' }"
            @click="handleStatusFilter('')"
          >
            全部
          </div>
          <div
            class="home-page__quick-filter"
            :class="{ 'is-active': filterOptions.expiryStatus === 'normal' }"
            @click="handleStatusFilter('normal')"
          >
            <el-icon><CircleCheck /></el-icon>
            正常
          </div>
          <div
            class="home-page__quick-filter"
            :class="{ 'is-active': filterOptions.expiryStatus === 'warning' }"
            @click="handleStatusFilter('warning')"
          >
            <el-icon><Clock /></el-icon>
            即将过期
          </div>
          <div
            class="home-page__quick-filter"
            :class="{ 'is-active': filterOptions.expiryStatus === 'expired' }"
            @click="handleStatusFilter('expired')"
          >
            <el-icon><Warning /></el-icon>
            已过期
          </div>
        </div>
      </div>

      <div class="home-page__section">
        <div class="home-page__section-header">
          <h2 class="home-page__section-title">最近添加</h2>
          <el-button type="primary" text @click="handleReset">
            查看全部
          </el-button>
        </div>

        <div v-if="recentMedicines.length > 0" class="home-page__medicine-grid">
          <MedicineCard
            v-for="(medicine, index) in recentMedicines"
            :key="medicine.id"
            :medicine="medicine"
            :tags="tagList"
            :index="index"
            @view="handleViewMedicine"
            @edit="handleEditMedicine"
            @delete="handleDeleteMedicine"
          />
        </div>

        <Empty
          v-else
          description="暂无药品，点击右上角按钮添加"
          :show-action="true"
          action-text="添加药品"
          @action="handleAddMedicine"
        />
      </div>
    </main>

    <MedicineForm
      v-model:visible="showAddDialog"
      :medicine="editingMedicine"
      :tags="tagList"
      @save="handleSaveMedicine"
      @update="handleUpdateMedicine"
      @manage-tags="handleManageTags"
    />

    <MedicineDetail
      v-model:visible="showDetailDialog"
      :medicine="viewingMedicine"
      :tags="tagList"
      @edit="handleEditMedicine"
    />

    <TagManager
      v-model:visible="showTagManager"
      :tags="tagList"
      @save="handleSaveTag"
      @delete="handleDeleteTag"
    />

    <ExportDialog
      v-model:visible="showExportDialog"
      :all-count="medicineList.length"
      :filtered-count="filteredMedicineList.length"
      @export="handleExport"
    />
  </div>
</template>

<style scoped lang="scss">
.home-page {
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
    justify-content: space-between;
    gap: 16px;
  }

  &__title-wrap {
    flex: 1;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
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

  &__quick-nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  &__nav-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-sm);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  }

  &__nav-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  &__nav-info {
    flex: 1;
    min-width: 0;
  }

  &__nav-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 4px 0;
  }

  &__nav-desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0 0 8px 0;
  }

  &__nav-stats {
    display: flex;
    gap: 12px;
  }

  &__nav-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--color-text-secondary);

    .el-icon {
      font-size: 14px;
    }

    &--warning {
      color: #f59e0b;
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

  &__category-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  &__category-stat {
    background: var(--color-bg-card);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-sm);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  &__category-label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__category-count {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
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

  &__section {
    margin-bottom: 24px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__medicine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .home-page {
    &__stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    &__category-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    &__quick-nav {
      grid-template-columns: 1fr;
    }

    &__search-bar {
      flex-direction: column;
      align-items: stretch;

      > * {
        width: 100%;
      }
    }

    &__medicine-grid {
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
