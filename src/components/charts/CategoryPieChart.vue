<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <el-icon><PieChart /></el-icon>
        药品分类占比
      </h3>
      <div class="chart-actions">
        <el-button size="small" type="primary" :icon="Download" @click="handleExport">
          导出图片
        </el-button>
      </div>
    </div>
    <div id="category-pie-chart" ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Download, PieChart } from '@element-plus/icons-vue'
import { getMedicineList } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import { ElMessage } from 'element-plus'
import { CATEGORY_LIST, MEDICINE_CATEGORY_LABELS } from '@/types/medicine'
import type { MedicineCategory, CategoryData } from '@/types/medicine'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

function getCategoryData(): CategoryData[] {
  const medicines = getMedicineList()
  const categoryCount: Record<MedicineCategory, number> = {
    cold: 0,
    fever: 0,
    stomach: 0,
    antibiotic: 0,
    external: 0,
    chronic: 0,
    health: 0,
    other: 0,
  }

  medicines.forEach((medicine) => {
    if (categoryCount.hasOwnProperty(medicine.category)) {
      categoryCount[medicine.category]++
    }
  })

  return CATEGORY_LIST.map((cat) => ({
    name: cat.label,
    value: categoryCount[cat.value] || 0,
    color: cat.color,
  })).filter((item) => item.value > 0)
}

function updateChart() {
  if (!chartInstance) return

  const data = getCategoryData()
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        const percent = ((params.value / total) * 100).toFixed(1)
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%; margin-right: 8px;"></span>
            <span>数量: <strong>${params.value}</strong> 种</span>
          </div>
          <div style="margin-top: 4px; color: #6b7280;">
            占比: <strong>${percent}%</strong>
          </div>
        </div>`
      },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
      formatter: (name: string) => {
        const item = data.find((d) => d.name === name)
        if (!item) return name
        const percent = ((item.value / total) * 100).toFixed(1)
        return `${name}  ${percent}%`
      },
    },
    series: [
      {
        name: '药品分类',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
            formatter: (params: any) => {
              const percent = ((params.value / total) * 100).toFixed(1)
              return `{name|${params.name}}\n{value|${params.value}种}\n{percent|${percent}%}`
            },
            rich: {
              name: {
                fontSize: 14,
                color: '#6b7280',
                padding: [0, 0, 4, 0],
              },
              value: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1f2937',
                padding: [4, 0],
              },
              percent: {
                fontSize: 14,
                color: '#3b82f6',
                padding: [4, 0, 0, 0],
              },
            },
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  }

  chartInstance.setOption(option, true)
}

async function handleExport() {
  try {
    await exportEChartsAsImage(
      chartInstance,
      `药品分类占比_${new Date().toISOString().split('T')[0]}`,
      'png'
    )
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  }
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
  min-height: 320px;
  width: 100%;
}
</style>
