<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">
        <el-icon><UserFilled /></el-icon>
        家庭成员用药分配
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
    <div id="family-usage-radar-chart" ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Download, UserFilled } from '@element-plus/icons-vue'
import { getUsageRecords } from '@/utils/storage'
import { exportEChartsAsImage } from '@/utils/chartExport'
import { ElMessage } from 'element-plus'
import { FAMILY_MEMBERS } from '@/types/medicine'
import type { FamilyUsageData } from '@/types/medicine'

const timeRange = ref('30')
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

function getFamilyUsageData(days: number): FamilyUsageData[] {
  const records = getUsageRecords()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days + 1)

  const memberCount: Record<string, number> = {}
  FAMILY_MEMBERS.forEach((member) => {
    memberCount[member.value] = 0
  })

  records.forEach((record) => {
    const recordDate = record.usageDate || record.date
    if (!recordDate) return

    const recordDateTime = new Date(recordDate).getTime()
    if (recordDateTime >= startDate.getTime()) {
      const member = record.familyMember || 'other'
      if (memberCount.hasOwnProperty(member)) {
        memberCount[member]++
      } else {
        memberCount['other']++
      }
    }
  })

  return FAMILY_MEMBERS.map((member) => ({
    member: member.value,
    count: memberCount[member.value] || 0,
    color: member.color,
  }))
}

function updateChart() {
  if (!chartInstance) return

  const days = parseInt(timeRange.value)
  const data = getFamilyUsageData(days)
  const maxCount = Math.max(...data.map((d) => d.count), 1)

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
        const memberInfo = FAMILY_MEMBERS.find((m) => m.label === params.name)
        return `<div style="padding: 4px 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${memberInfo?.color || params.color}; border-radius: 50%; margin-right: 8px;"></span>
            <span>用药次数: <strong>${params.value}</strong> 次</span>
          </div>
        </div>`
      },
    },
    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: {
        color: '#6b7280',
        fontSize: 11,
      },
    },
    radar: {
      indicator: FAMILY_MEMBERS.map((member) => ({
        name: member.label,
        max: Math.ceil(maxCount * 1.2),
      })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#6b7280',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#fafafa', '#f5f5f5', '#fafafa', '#f5f5f5'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      center: ['50%', '45%'],
      radius: '60%',
    },
    series: [
      {
        name: '用药次数',
        type: 'radar',
        data: [
          {
            value: data.map((d) => d.count),
            name: '用药次数',
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#8b5cf6',
            },
            itemStyle: {
              color: '#8b5cf6',
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.5)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.1)' },
              ]),
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(139, 92, 246, 0.5)',
              },
            },
          },
        ],
      },
    ],
  }

  chartInstance.setOption(option, true)
}

async function handleExport() {
  try {
    const days = parseInt(timeRange.value)
    const rangeText = days === 30 ? '近30天' : days === 90 ? '近90天' : '全年'
    await exportEChartsAsImage(
      chartInstance,
      `家庭成员用药分配_${rangeText}_${new Date().toISOString().split('T')[0]}`,
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
  color: #8b5cf6;
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
