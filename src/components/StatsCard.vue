<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { FirstAidKit, TrendCharts, Warning, CircleClose } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number
  type: 'total' | 'warning' | 'expired' | 'normal'
}

const props = defineProps<Props>()

const displayValue = ref(0)

const iconComponent = computed(() => {
  switch (props.type) {
    case 'total':
      return FirstAidKit
    case 'warning':
      return Warning
    case 'expired':
      return CircleClose
    default:
      return TrendCharts
  }
})

const cardGradient = computed(() => {
  switch (props.type) {
    case 'total':
      return 'linear-gradient(135deg, #4A90D9 0%, #7AB0E8 100%)'
    case 'warning':
      return 'linear-gradient(135deg, #FFB74D 0%, #FFD54F 100%)'
    case 'expired':
      return 'linear-gradient(135deg, #EF5350 0%, #E57373 100%)'
    default:
      return 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)'
  }
})

const animateValue = (start: number, end: number, duration: number) => {
  const startTime = performance.now()
  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(start + (end - start) * easeProgress)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  animateValue(0, props.value, 800)
})
</script>

<template>
  <div class="stats-card" :class="`stats-card--${type}`">
    <div class="stats-card__bg" :style="{ background: cardGradient }" />
    <div class="stats-card__content">
      <div class="stats-card__icon">
        <el-icon :size="32" :color="'#fff'">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="stats-card__info">
        <div class="stats-card__title">{{ title }}</div>
        <div class="stats-card__value">{{ displayValue }}</div>
      </div>
    </div>
    <div class="stats-card__decor">
      <div class="stats-card__circle" />
      <div class="stats-card__circle stats-card__circle--sm" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-card {
  position: relative;
  border-radius: var(--radius-xl);
  padding: 24px;
  min-height: 120px;
  overflow: hidden;
  cursor: default;
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    height: 100%;
  }

  &__icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
    font-weight: 500;
  }

  &__value {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__decor {
    position: absolute;
    right: -20px;
    top: -20px;
    z-index: 0;
  }

  &__circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);

    &--sm {
      width: 60px;
      height: 60px;
      position: absolute;
      right: 40px;
      top: 60px;
      background: rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
