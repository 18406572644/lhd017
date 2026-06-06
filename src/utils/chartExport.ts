import html2canvas from 'html2canvas'
import type { ECharts } from 'echarts'

export async function exportChartAsImage(
  chartInstance: ECharts | null,
  containerId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): Promise<void> {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error('图表容器不存在')
  }

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = canvas.toDataURL(mimeType, quality)

    const link = document.createElement('a')
    link.download = `${filename}.${format}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('导出图表失败:', error)
    throw new Error('导出图表失败，请重试')
  }
}

export async function exportEChartsAsImage(
  chartInstance: ECharts | null,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  if (!chartInstance) {
    throw new Error('图表实例不存在')
  }

  try {
    const dataUrl = chartInstance.getDataURL({
      type: format,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    link.download = `${filename}.${format}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('导出图表失败:', error)
    throw new Error('导出图表失败，请重试')
  }
}
