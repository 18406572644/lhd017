<script setup lang="ts">
import { computed } from 'vue'
import { Warning, InfoFilled, CircleCheck, CaretBottom, CaretRight, Right } from '@element-plus/icons-vue'
import type {
  ComprehensiveCheckResult,
  InteractionCheckResult,
  ContraindicationCheckResult,
} from '@/types/medicine'
import {
  INTERACTION_RISK_INFO,
  INTERACTION_TYPE_LABELS,
  SPECIAL_PERIOD_INFO,
} from '@/types/medicine'

interface Props {
  result: ComprehensiveCheckResult | null
  showDetails?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  compact: false,
})

const expandedInteractions = new Set<string>()
const expandedContraindications = new Set<string>()

const toggleInteraction = (index: number) => {
  const key = `interaction-${index}`
  if (expandedInteractions.has(key)) {
    expandedInteractions.delete(key)
  } else {
    expandedInteractions.add(key)
  }
}

const toggleContraindication = (index: number) => {
  const key = `contra-${index}`
  if (expandedContraindications.has(key)) {
    expandedContraindications.delete(key)
  } else {
    expandedContraindications.add(key)
  }
}

const isInteractionExpanded = (index: number) => {
  return expandedInteractions.has(`interaction-${index}`)
}

const isContraindicationExpanded = (index: number) => {
  return expandedContraindications.has(`contra-${index}`)
}

const overallRiskInfo = computed(() => {
  if (!props.result) return null
  return INTERACTION_RISK_INFO[props.result.overallRisk]
})

const hasDanger = computed(() => {
  if (!props.result) return false
  return (
    props.result.interactionResults.some((r) => r.riskLevel === 'danger') ||
    props.result.contraindicationResults.some((r) => r.riskLevel === 'danger')
  )
})

const hasCaution = computed(() => {
  if (!props.result) return false
  return (
    props.result.interactionResults.some((r) => r.riskLevel === 'caution') ||
    props.result.contraindicationResults.some((r) => r.riskLevel === 'caution')
  )
})

const dangerCount = computed(() => {
  if (!props.result) return 0
  return (
    props.result.interactionResults.filter((r) => r.riskLevel === 'danger').length +
    props.result.contraindicationResults.filter((r) => r.riskLevel === 'danger').length
  )
})

const cautionCount = computed(() => {
  if (!props.result) return 0
  return (
    props.result.interactionResults.filter((r) => r.riskLevel === 'caution').length +
    props.result.contraindicationResults.filter((r) => r.riskLevel === 'caution').length
  )
})

const getInteractionTypeLabel = (type: string) => {
  return INTERACTION_TYPE_LABELS[type as keyof typeof INTERACTION_TYPE_LABELS] || type
}

const getSpecialPeriodLabel = (period: string) => {
  const info = SPECIAL_PERIOD_INFO[period as keyof typeof SPECIAL_PERIOD_INFO]
  return info ? `${info.icon} ${info.label}` : period
}
</script>

<template>
  <div v-if="result" class="drug-interaction-alert">
    <div
      class="drug-interaction-alert__header"
      :style="{
        backgroundColor: overallRiskInfo?.bgColor,
        borderColor: overallRiskInfo?.borderColor,
      }"
    >
      <div class="drug-interaction-alert__icon" :style="{ color: overallRiskInfo?.color }">
        <el-icon :size="32">
          <Warning v-if="result.overallRisk === 'danger'" />
          <Warning v-else-if="result.overallRisk === 'caution'" />
          <CircleCheck v-else />
        </el-icon>
      </div>
      <div class="drug-interaction-alert__content">
        <div class="drug-interaction-alert__title">
          <span
            class="drug-interaction-alert__badge"
            :style="{
              backgroundColor: overallRiskInfo?.color,
              color: '#fff',
            }"
          >
            {{ overallRiskInfo?.icon }} {{ overallRiskInfo?.label }}
          </span>
          <span class="drug-interaction-alert__date">
            检测时间：{{ result.checkedDate }}
          </span>
        </div>
        <div class="drug-interaction-alert__summary">
          <span v-if="hasDanger" class="drug-interaction-alert__count danger">
            🔴 {{ dangerCount }} 项禁用风险
          </span>
          <span v-if="hasCaution" class="drug-interaction-alert__count caution">
            🟡 {{ cautionCount }} 项慎用提醒
          </span>
          <span v-if="result.safeDrugs.length > 0" class="drug-interaction-alert__count safe">
            🟢 {{ result.safeDrugs.length }} 项安全
          </span>
        </div>
        <div v-if="!compact && result.overallRisk !== 'safe'" class="drug-interaction-alert__warning">
          <el-icon :size="14"><Warning /></el-icon>
          <span v-if="result.overallRisk === 'danger'">
            存在严重风险，请勿同时使用，如有疑问请立即咨询医生或药师！
          </span>
          <span v-else>
            存在潜在风险，请谨慎使用，建议咨询医生或药师。
          </span>
        </div>
      </div>
    </div>

    <div v-if="result.interactionResults.length > 0" class="drug-interaction-alert__section">
      <h4 class="drug-interaction-alert__section-title">
        <el-icon><Warning /></el-icon>
        药品相互作用检测 ({{ result.interactionResults.length }} 项)
      </h4>
      <div class="drug-interaction-alert__list">
        <div
          v-for="(item, index) in result.interactionResults"
          :key="index"
          class="interaction-item"
          :class="`is-${item.riskLevel}`"
        >
          <div class="interaction-item__header" @click="toggleInteraction(index)">
            <div class="interaction-item__risk">
              <span
                class="interaction-item__badge"
                :style="{
                  backgroundColor: INTERACTION_RISK_INFO[item.riskLevel].color,
                  color: '#fff',
                }"
              >
                {{ INTERACTION_RISK_INFO[item.riskLevel].icon }}
                {{ INTERACTION_RISK_INFO[item.riskLevel].label }}
              </span>
              <span class="interaction-item__type">
                {{ getInteractionTypeLabel(item.type) }}
              </span>
            </div>
            <div class="interaction-item__drugs">
              <span class="interaction-item__drug">{{ item.drugName }}</span>
              <el-icon class="interaction-item__arrow"><Right /></el-icon>
              <span class="interaction-item__drug interacting">{{ item.interactingDrugName }}</span>
            </div>
            <el-icon class="interaction-item__expand">
              <CaretBottom v-if="isInteractionExpanded(index)" />
              <CaretRight v-else />
            </el-icon>
          </div>

          <div v-show="isInteractionExpanded(index) || showDetails" class="interaction-item__details">
            <div class="interaction-item__detail-row">
              <div class="interaction-item__label">作用机制：</div>
              <div class="interaction-item__value">{{ item.mechanism }}</div>
            </div>
            <div v-if="item.symptoms.length > 0" class="interaction-item__detail-row">
              <div class="interaction-item__label">可能症状：</div>
              <div class="interaction-item__value">
                <el-tag
                  v-for="(symptom, idx) in item.symptoms"
                  :key="idx"
                  size="small"
                  type="danger"
                  effect="light"
                  class="interaction-item__symptom"
                >
                  {{ symptom }}
                </el-tag>
              </div>
            </div>
            <div v-if="item.interactionDate" class="interaction-item__detail-row">
              <div class="interaction-item__label">关联日期：</div>
              <div class="interaction-item__value">近7天内曾使用 {{ item.interactionDate }}</div>
            </div>
            <div class="interaction-item__detail-row suggestions">
              <div class="interaction-item__label">处理建议：</div>
              <div class="interaction-item__value">
                <ul class="interaction-item__suggestions">
                  <li v-for="(suggestion, idx) in item.suggestions" :key="idx">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="result.contraindicationResults.length > 0"
      class="drug-interaction-alert__section"
    >
      <h4 class="drug-interaction-alert__section-title">
        <el-icon><InfoFilled /></el-icon>
        特殊时期禁忌检测 ({{ result.contraindicationResults.length }} 项)
      </h4>
      <div class="drug-interaction-alert__list">
        <div
          v-for="(item, index) in result.contraindicationResults"
          :key="index"
          class="contraindication-item"
          :class="`is-${item.riskLevel}`"
        >
          <div class="contraindication-item__header" @click="toggleContraindication(index)">
            <div class="contraindication-item__risk">
              <span
                class="contraindication-item__badge"
                :style="{
                  backgroundColor: INTERACTION_RISK_INFO[item.riskLevel].color,
                  color: '#fff',
                }"
              >
                {{ INTERACTION_RISK_INFO[item.riskLevel].icon }}
                {{ INTERACTION_RISK_INFO[item.riskLevel].label }}
              </span>
              <span class="contraindication-item__period">
                {{ getSpecialPeriodLabel(item.specialPeriod) }}
              </span>
            </div>
            <div class="contraindication-item__drug">{{ item.drugName }}</div>
            <el-icon class="contraindication-item__expand">
              <CaretBottom v-if="isContraindicationExpanded(index)" />
              <CaretRight v-else />
            </el-icon>
          </div>

          <div
            v-show="isContraindicationExpanded(index) || showDetails"
            class="contraindication-item__details"
          >
            <div class="contraindication-item__detail-row">
              <div class="contraindication-item__label">作用机制：</div>
              <div class="contraindication-item__value">{{ item.mechanism }}</div>
            </div>
            <div v-if="item.symptoms.length > 0" class="contraindication-item__detail-row">
              <div class="contraindication-item__label">风险症状：</div>
              <div class="contraindication-item__value">
                <el-tag
                  v-for="(symptom, idx) in item.symptoms"
                  :key="idx"
                  size="small"
                  type="danger"
                  effect="light"
                  class="contraindication-item__symptom"
                >
                  {{ symptom }}
                </el-tag>
              </div>
            </div>
            <div class="contraindication-item__detail-row suggestions">
              <div class="contraindication-item__label">处理建议：</div>
              <div class="contraindication-item__value">
                <ul class="contraindication-item__suggestions">
                  <li v-for="(suggestion, idx) in item.suggestions" :key="idx">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="item.alternativeDrugs && item.alternativeDrugs.length > 0" class="contraindication-item__detail-row">
              <div class="contraindication-item__label">替代方案：</div>
              <div class="contraindication-item__value">
                <el-tag
                  v-for="(drug, idx) in item.alternativeDrugs"
                  :key="idx"
                  size="small"
                  type="success"
                  effect="light"
                  class="contraindication-item__alternative"
                >
                  {{ drug }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result.safeDrugs.length > 0 && !compact" class="drug-interaction-alert__section safe">
      <h4 class="drug-interaction-alert__section-title safe">
        <el-icon><CircleCheck /></el-icon>
        安全用药 ({{ result.safeDrugs.length }} 项)
      </h4>
      <div class="drug-interaction-alert__safe-drugs">
        <el-tag
          v-for="(drug, index) in result.safeDrugs"
          :key="index"
          type="success"
          effect="light"
          class="drug-interaction-alert__safe-tag"
        >
          🟢 {{ drug }}
        </el-tag>
      </div>
    </div>

    <div class="drug-interaction-alert__disclaimer">
      <el-icon :size="12"><InfoFilled /></el-icon>
      <span>本检测结果仅供参考，不能替代专业医疗建议。如有疑虑请咨询医生或药师。</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.drug-interaction-alert {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    border-radius: var(--radius-lg);
    border: 2px solid;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  &__date {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__summary {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  &__count {
    font-size: 13px;
    font-weight: 500;

    &.danger {
      color: #dc2626;
    }
    &.caution {
      color: #d97706;
    }
    &.safe {
      color: #059669;
    }
  }

  &__warning {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #dc2626;
    font-weight: 500;
    padding: 8px 12px;
    background: rgba(220, 38, 38, 0.1);
    border-radius: var(--radius-sm);
    margin-top: 4px;
  }

  &__section {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: 16px;
    box-shadow: var(--shadow-sm);

    &.safe {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 12px 0;

    &.safe {
      color: #059669;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__safe-drugs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__safe-tag {
    font-size: 13px;
    padding: 6px 12px;
  }

  &__disclaimer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-secondary);
    padding: 10px 16px;
    background: var(--color-bg-hover);
    border-radius: var(--radius-md);
  }
}

.interaction-item,
.contraindication-item {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-base);

  &.is-danger {
    border-color: #fecaca;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  }
  &.is-caution {
    border-color: #fde68a;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  }
  &.is-safe {
    border-color: #bbf7d0;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  }

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  &__risk {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  &__type,
  &__period {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__drugs {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__drug {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.interacting {
      color: #dc2626;
      font-weight: 600;
    }
  }

  &__arrow {
    color: var(--color-text-light);
    font-size: 12px;
  }

  &__expand {
    color: var(--color-text-secondary);
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  &__details {
    padding: 0 16px 16px;
    border-top: 1px solid var(--color-border-light);
  }

  &__detail-row {
    display: flex;
    gap: 12px;
    margin-top: 12px;

    &.suggestions {
      align-items: flex-start;
    }
  }

  &__label {
    flex-shrink: 0;
    width: 80px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__value {
    flex: 1;
    font-size: 13px;
    color: var(--color-text-primary);
    line-height: 1.6;
  }

  &__symptom,
  &__alternative {
    margin-right: 6px;
    margin-bottom: 4px;
  }

  &__suggestions {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 4px;
    }
  }
}

@media (max-width: 640px) {
  .drug-interaction-alert {
    &__header {
      padding: 16px;
    }

    &__title {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .interaction-item,
  .contraindication-item {
    &__header {
      flex-wrap: wrap;
    }

    &__drugs {
      width: 100%;
      order: 3;
    }

    &__detail-row {
      flex-direction: column;
      gap: 4px;
    }

    &__label {
      width: auto;
    }
  }
}
</style>
