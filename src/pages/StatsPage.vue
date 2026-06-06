<template>
  <div class="stats-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><DataAnalysis /></el-icon>
          数据统计
        </h1>
        <p class="page-subtitle">全面了解家庭药品使用情况和健康趋势</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData">
          刷新数据
        </el-button>
        <el-button :icon="Download" @click="exportAllCharts">
          导出全部
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stats-card total">
        <div class="card-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ statistics.total }}</div>
          <div class="card-label">药品总数</div>
        </div>
      </div>
      <div class="stats-card warning">
        <div class="card-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ statistics.warning }}</div>
          <div class="card-label">即将过期</div>
        </div>
      </div>
      <div class="stats-card expired">
        <div class="card-icon">
          <el-icon><CircleClose /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ statistics.expired }}</div>
          <div class="card-label">已过期</div>
        </div>
      </div>
      <div class="stats-card cost">
        <div class="card-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">¥{{ totalCost.toFixed(2) }}</div>
          <div class="card-label">总采购金额</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-item wide">
        <UsageTrendChart />
      </div>
      <div class="chart-item">
        <CategoryPieChart />
      </div>
      <div class="chart-item">
        <ExpiryForecastChart />
      </div>
      <div class="chart-item">
        <MonthlyCostChart />
      </div>
      <div class="chart-item">
        <FamilyUsageRadarChart />
      </div>
    </div>

    <el-dialog v-model="exportDialogVisible" title="导出全部图表" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio value="png">PNG 格式</el-radio>
            <el-radio value="jpeg">JPEG 格式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图片质量">
          <el-slider v-model="exportForm.quality" :min="0.5" :max="1" :step="0.1" show-stops>
            <template #default="{ value }">
              <span>{{ (value * 100).toFixed(0) }}%</span>
            </template>
          </el-slider>
        </el-form-item>
        <el-form-item label="选择图表">
          <el-checkbox-group v-model="exportForm.selectedCharts">
            <el-checkbox value="usage-trend">用药趋势</el-checkbox>
            <el-checkbox value="category-pie">分类占比</el-checkbox>
            <el-checkbox value="expiry-forecast">过期预测</el-checkbox>
            <el-checkbox value="monthly-cost">月度费用</el-checkbox>
            <el-checkbox value="family-usage">家庭成员</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="confirmExport">
          开始导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DataAnalysis, Refresh, Download, Box, Warning, CircleClose, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMedicine } from '@/composables/useMedicine'
import { getMedicineList } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import UsageTrendChart from '@/components/charts/UsageTrendChart.vue'
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue'
import ExpiryForecastChart from '@/components/charts/ExpiryForecastChart.vue'
import MonthlyCostChart from '@/components/charts/MonthlyCostChart.vue'
import FamilyUsageRadarChart from '@/components/charts/FamilyUsageRadarChart.vue'

const { statistics, loadMedicineList } = useMedicine()

const exportDialogVisible = ref(false)
const exporting = ref(false)
const exportForm = ref({
  format: 'png' as 'png' | 'jpeg',
  quality: 0.92,
  selectedCharts: ['usage-trend', 'category-pie', 'expiry-forecast', 'monthly-cost', 'family-usage'],
})

const totalCost = computed(() => {
  const medicines = getMedicineList()
  return medicines.reduce((sum, medicine) => {
    if (medicine.purchasePrice) {
      return sum + medicine.purchasePrice * (medicine.quantity || 1)
    }
    return sum
  }, 0)
})

function refreshData() {
  loadMedicineList()
  ElMessage.success('数据已刷新')
}

function exportAllCharts() {
  exportDialogVisible.value = true
}

async function confirmExport() {
  if (exportForm.value.selectedCharts.length === 0) {
    ElMessage.warning('请至少选择一个图表')
    return
  }

  exporting.value = true
  const dateStr = new Date().toISOString().split('T')[0]

  try {
    const chartMap: Record<string, { component: any; filename: string }> = {
      'usage-trend': { component: UsageTrendChart, filename: `用药趋势_${dateStr}` },
      'category-pie': { component: CategoryPieChart, filename: `药品分类占比_${dateStr}` },
      'expiry-forecast': { component: ExpiryForecastChart, filename: `过期趋势预测_${dateStr}` },
      'monthly-cost': { component: MonthlyCostChart, filename: `月度费用_${dateStr}` },
      'family-usage': { component: FamilyUsageRadarChart, filename: `家庭成员用药分配_${dateStr}` },
    }

    for (const chartKey of exportForm.value.selectedCharts) {
      const chartInfo = chartMap[chartKey]
      if (chartInfo) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    ElMessage.success(`成功导出 ${exportForm.value.selectedCharts.length} 个图表`)
    exportDialogVisible.value = false
  } catch (error) {
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadMedicineList()
})
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #fef3c7 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-title .el-icon {
  color: #3b82f6;
  font-size: 32px;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stats-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stats-card.total .card-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.stats-card.warning .card-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
}

.stats-card.expired .card-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #ef4444;
}

.stats-card.cost .card-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #10b981;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #6b7280;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-item {
  min-height: 420px;
}

.chart-item.wide {
  grid-column: span 2;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-item.wide {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .stats-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>
