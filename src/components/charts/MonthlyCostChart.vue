<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <el-icon><Money /></el-icon>
        月度费用统计
      </h3>
      <div class="chart-actions">
        <el-radio-group v-model="monthRange" size="small" @change="updateChart">
          <el-radio-button value="6">近6个月</el-radio-button>
          <el-radio-button value="12">近12个月</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="primary" :icon="Download" @click="handleExport">
          导出图片
        </el-button>
      </div>
    </div>
    <div id="monthly-cost-chart" ref="chartRef" class="chart-container"></div>
    <div v-if="hasMissingPrice" class="price-warning">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        size="small"
      >
        <template #title>
          <span>部分药品未设置采购价格，统计数据可能不完整。</span>
          <el-button type="primary" link size="small" @click="goToSetPrice">
            去设置价格
          </el-button>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Download, Money } from '@element-plus/icons-vue'
import { getMedicineList } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { MonthlyCostData } from '@/types/medicine'

const router = useRouter()
const monthRange = ref('6')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

const hasMissingPrice = computed(() => {
  const medicines = getMedicineList()
  return medicines.some((m) => !m.purchasePrice || m.purchasePrice <= 0)
})

function getMonthlyCostData(months: number): MonthlyCostData[] {
  const medicines = getMedicineList()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthMap = new Map<string, number>()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(monthKey, 0)
  }

  medicines.forEach((medicine) => {
    if (!medicine.purchaseDate || !medicine.purchasePrice) return

    const purchaseDate = new Date(medicine.purchaseDate)
    const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`

    if (monthMap.has(monthKey)) {
      const current = monthMap.get(monthKey) || 0
      const totalCost = medicine.purchasePrice * (medicine.quantity || 1)
      monthMap.set(monthKey, current + totalCost)
    }
  })

  return Array.from(monthMap.entries()).map(([month, cost]) => ({
    month,
    cost: Math.round(cost * 100) / 100,
  }))
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  return `${parseInt(month)}月`
}

function updateChart() {
  if (!chartInstance) return

  const months = parseInt(monthRange.value)
  const data = getMonthlyCostData(months)
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const data = params[0]
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${data.color}; border-radius: 50%; margin-right: 8px;"></span>
            <span>采购费用: <strong>¥${data.value.toFixed(2)}</strong></span>
          </div>
        </div>`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => formatMonth(d.month)),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (value: number) => `¥${value}`,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '采购费用',
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: '#34d399' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#059669' },
              { offset: 1, color: '#10b981' },
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(16, 185, 129, 0.4)',
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#10b981',
          fontWeight: 'bold',
          fontSize: 12,
          formatter: (params: any) => `¥${params.value.toFixed(0)}`,
        },
        data: data.map((d) => d.cost),
      },
    ],
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: 10,
          style: {
            text: `总费用: ¥${totalCost.toFixed(2)}`,
            fontSize: 13,
            fontWeight: 'bold',
            fill: '#1f2937',
          },
        },
      ],
    },
  }

  chartInstance.setOption(option, true)
}

async function handleExport() {
  try {
    const months = parseInt(monthRange.value)
    const rangeText = months === 6 ? '近6个月' : '近12个月'
    await exportEChartsAsImage(
      chartInstance,
      `月度费用_${rangeText}_${new Date().toISOString().split('T')[0]}`,
      'png'
    )
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
}

function goToSetPrice() {
  router.push('/')
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(monthRange, () => {
  updateChart()
})
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-title .el-icon {
  color: #10b981;
  font-size: 20px;
}

.chart-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-container {
  flex: 1;
  min-height: 280px;
  width: 100%;
}

.price-warning {
  margin-top: 12px;
}

.price-warning :deep(.el-alert__title) {
  font-size: 12px;
}
</style>
