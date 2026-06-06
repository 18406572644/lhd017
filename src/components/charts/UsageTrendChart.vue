<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <el-icon><TrendCharts /></el-icon>
        用药趋势
      </h3>
      <div class="chart-actions">
        <el-radio-group v-model="timeRange" size="small" @change="updateChart">
          <el-radio-button value="30">近30天</el-radio-button>
          <el-radio-button value="90">近90天</el-radio-button>
          <el-radio-button value="365">全年</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="primary" :icon="Download" @click="handleExport">
          导出图片
        </el-button>
      </div>
    </div>
    <div id="usage-trend-chart" ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Download, TrendCharts } from '@element-plus/icons-vue'
import { getUsageRecords } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import { ElMessage } from 'element-plus'
import type { UsageTrendData } from '@/types/medicine'

const timeRange = ref('30')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

function getUsageTrendData(days: number): UsageTrendData[] {
  const records = getUsageRecords()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateMap = new Map<string, number>()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dateMap.set(dateStr, 0)
  }

  records.forEach((record) => {
    const recordDate = record.usageDate || record.date
    if (!recordDate) return

    const recordDateTime = new Date(recordDate).getTime()
    const startDateTime = new Date(today).setDate(today.getDate() - days + 1)

    if (recordDateTime >= startDateTime) {
      const dateStr = recordDate
      const currentCount = dateMap.get(dateStr) || 0
      dateMap.set(dateStr, currentCount + 1)
    }
  })

  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}

function formatDate(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  if (days <= 30) {
    return `${date.getMonth() + 1}/${date.getDate()}`
  } else if (days <= 90) {
    return `${date.getMonth() + 1}/${date.getDate()}`
  } else {
    return `${date.getMonth() + 1}月`
  }
}

function aggregateData(data: UsageTrendData[], days: number): { xData: string[]; yData: number[] } {
  if (days <= 30) {
    return {
      xData: data.map((d) => formatDate(d.date, days)),
      yData: data.map((d) => d.count),
    }
  } else if (days <= 90) {
    const weekMap = new Map<string, number>()
    data.forEach((d) => {
      const date = new Date(d.date)
      const weekNum = Math.floor(date.getDate() / 7) + 1
      const key = `${date.getMonth() + 1}月第${weekNum}周`
      const current = weekMap.get(key) || 0
      weekMap.set(key, current + d.count)
    })
    return {
      xData: Array.from(weekMap.keys()),
      yData: Array.from(weekMap.values()),
    }
  } else {
    const monthMap = new Map<string, number>()
    data.forEach((d) => {
      const date = new Date(d.date)
      const key = `${date.getMonth() + 1}月`
      const current = monthMap.get(key) || 0
      monthMap.set(key, current + d.count)
    })
    return {
      xData: Array.from(monthMap.keys()),
      yData: Array.from(monthMap.values()),
    }
  }
}

function updateChart() {
  if (!chartInstance) return

  const days = parseInt(timeRange.value)
  const rawData = getUsageTrendData(days)
  const { xData, yData } = aggregateData(rawData, days)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        const data = params[0]
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-right: 8px;"></span>
            <span>用药次数: <strong>${data.value}</strong> 次</span>
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
      boundaryGap: false,
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
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
        name: '用药次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: '#3b82f6',
        },
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2,
          borderColor: '#ffffff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ]),
        },
        data: yData,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
        },
      },
    ],
  }

  chartInstance.setOption(option, true)
}

async function handleExport() {
  try {
    const days = parseInt(timeRange.value)
    const rangeText = days === 30 ? '近30天' : days === 90 ? '近90天' : '全年'
    await exportEChartsAsImage(chartInstance, `用药趋势_${rangeText}_${new Date().toISOString().split('T')[0]}`, 'png')
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

watch(timeRange, () => {
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
  color: #3b82f6;
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
