<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <el-icon><AlarmClock /></el-icon>
        过期趋势预测
      </h3>
      <div class="chart-actions">
        <el-button size="small" type="primary" :icon="Download" @click="handleExport">
          导出图片
        </el-button>
      </div>
    </div>
    <div id="expiry-forecast-chart" ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Download, AlarmClock } from '@element-plus/icons-vue'
import { getMedicineList } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import { ElMessage } from 'element-plus'
import type { ExpiryForecastData } from '@/types/medicine'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

function getExpiryForecastData(): ExpiryForecastData[] {
  const medicines = getMedicineList()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const periods = [
    { name: '1个月内', days: 30 },
    { name: '3个月内', days: 90 },
    { name: '6个月内', days: 180 },
  ]

  return periods.map((period) => {
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + period.days)

    const count = medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiryDate)
      return expiryDate >= today && expiryDate <= endDate
    }).length

    return {
      period: period.name,
      count,
    }
  })
}

function updateChart() {
  if (!chartInstance) return

  const data = getExpiryForecastData()
  const maxCount = Math.max(...data.map((d) => d.count), 1)

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
            <span>即将过期: <strong>${data.value}</strong> 种</span>
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
      data: data.map((d) => d.period),
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
        fontSize: 12,
        fontWeight: 500,
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
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
      max: Math.ceil(maxCount * 1.2),
    },
    series: [
      {
        name: '即将过期',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: '#fbbf24' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#d97706' },
              { offset: 1, color: '#f59e0b' },
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(245, 158, 11, 0.4)',
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#f59e0b',
          fontWeight: 'bold',
          fontSize: 14,
          formatter: '{c} 种',
        },
        data: data.map((d) => d.count),
      },
    ],
  }

  chartInstance.setOption(option, true)
}

async function handleExport() {
  try {
    await exportEChartsAsImage(
      chartInstance,
      `过期趋势预测_${new Date().toISOString().split('T')[0]}`,
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
  color: #f59e0b;
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
