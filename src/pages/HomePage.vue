<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { FirstAidKit } from '@element-plus/icons-vue'
import type { Medicine } from '@/types/medicine'
import { useMedicine } from '@/composables/useMedicine'
import StatsCard from '@/components/StatsCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import MedicineCard from '@/components/MedicineCard.vue'
import MedicineForm from '@/components/MedicineForm.vue'
import MedicineDetail from '@/components/MedicineDetail.vue'

const {
  filteredMedicineList,
  filterOptions,
  statistics,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  setFilter,
  resetFilter,
} = useMedicine()

const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const editingMedicine = ref<Medicine | null>(null)
const viewingMedicine = ref<Medicine | null>(null)

const handleAdd = () => {
  editingMedicine.value = null
  showFormDialog.value = true
}

const handleView = (medicine: Medicine) => {
  viewingMedicine.value = medicine
  showDetailDialog.value = true
}

const handleEdit = (medicine: Medicine) => {
  editingMedicine.value = medicine
  showFormDialog.value = true
  showDetailDialog.value = false
}

const handleEditFromDetail = (medicine: Medicine) => {
  editingMedicine.value = medicine
  showFormDialog.value = true
}

const handleDelete = async (medicine: Medicine) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除药品「${medicine.name}」吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )
    deleteMedicine(medicine.id)
    ElMessage.success('药品删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleSave = (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
  addMedicine(data)
}

const handleUpdate = (id: string, data: Partial<Medicine>) => {
  updateMedicine(id, data)
}
</script>

<template>
  <div class="home-page">
    <header class="home-page__header">
      <div class="home-page__header-content">
        <div class="home-page__logo">
          <div class="home-page__logo-icon">
            <el-icon :size="32"><FirstAidKit /></el-icon>
          </div>
          <div class="home-page__logo-text">
            <h1 class="home-page__title">家庭药品管理</h1>
            <p class="home-page__subtitle">守护家人用药安全，智能提醒效期预警</p>
          </div>
        </div>
      </div>
    </header>

    <main class="home-page__main">
      <div class="home-page__stats">
        <StatsCard title="药品总数" :value="statistics.total" type="total" />
        <StatsCard title="即将过期" :value="statistics.warning" type="warning" />
        <StatsCard title="已过期" :value="statistics.expired" type="expired" />
        <StatsCard
          title="正常可用"
          :value="statistics.total - statistics.warning - statistics.expired"
          type="normal"
        />
      </div>

      <FilterBar
        :filter-options="filterOptions"
        @update:filter-options="setFilter"
        @reset="resetFilter"
        @add="handleAdd"
      />

      <div class="home-page__list-header">
        <h2 class="home-page__list-title">
          药品列表
          <span class="home-page__list-count">{{ filteredMedicineList.length }} 种</span>
        </h2>
      </div>

      <div
        v-if="filteredMedicineList.length > 0"
        class="home-page__grid"
      >
        <MedicineCard
          v-for="(medicine, index) in filteredMedicineList"
          :key="medicine.id"
          :medicine="medicine"
          :index="index"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <el-empty
        v-else
        class="home-page__empty"
        description="暂无符合条件的药品"
      />
    </main>

    <MedicineForm
      v-model:visible="showFormDialog"
      :medicine="editingMedicine"
      @save="handleSave"
      @update="handleUpdate"
    />

    <MedicineDetail
      v-model:visible="showDetailDialog"
      :medicine="viewingMedicine"
      @edit="handleEditFromDetail"
    />
  </div>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    background: linear-gradient(135deg, #4A90D9 0%, #357ABD 50%, #7ECFC0 100%);
    padding: 32px 40px;
    color: #fff;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      right: -100px;
      top: -100px;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }

    &::after {
      content: '';
      position: absolute;
      right: 100px;
      bottom: -80px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &__header-content {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__logo-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  &__logo-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 1px;
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
    font-weight: 400;
  }

  &__main {
    flex: 1;
    padding: 24px 40px 40px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }

  &__list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 0 4px;
  }

  &__list-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__list-count {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin-left: 8px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  &__empty {
    padding: 60px 0;
  }
}

@media (max-width: 1200px) {
  .home-page {
    &__stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    &__header {
      padding: 24px 20px;
    }

    &__title {
      font-size: 22px;
    }

    &__main {
      padding: 20px;
    }

    &__stats {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    &__grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>
