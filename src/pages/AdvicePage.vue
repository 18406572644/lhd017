<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft, Reading, DataAnalysis, FirstAidKit, Warning, ArrowLeft, Edit, Delete, View, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMedicineAdvice } from '@/composables/useMedicineAdvice'
import { useTag } from '@/composables/useTag'
import DisclaimerBanner from '@/components/DisclaimerBanner.vue'
import MedicineDetail from '@/components/MedicineDetail.vue'
import UsageRecordForm from '@/components/UsageRecordForm.vue'
import HealthProfileManager from '@/components/HealthProfileManager.vue'
import type { Medicine, MedicineRecommendation, FamilyMember } from '@/types/medicine'
import { CATEGORY_LIST, EFFECT_OPTIONS, SEVERITY_INFO } from '@/types/medicine'
import { calculateExpiryStatus, formatDaysLeft } from '@/utils/date'
import { EXPIRY_STATUS_INFO } from '@/types/medicine'

const router = useRouter()
const { tagList } = useTag()
const {
  symptomInput,
  isAnalyzing,
  recommendations,
  matchedSymptoms,
  commonSymptomSuggestions,
  analyzeSymptoms,
  quickSelectSymptom,
  clearResults,
  getSeverityWarning,
  getEffectivenessStats,
  getMostUsedMedicines,
  getTopSymptoms,
  loadUsageRecords,
  usageRecords,
  createUsageRecord,
  removeUsageRecord,
} = useMedicineAdvice()

const inputValue = ref('')
const showDetailDialog = ref(false)
const showRecordDialog = ref(false)
const showHealthProfile = ref(false)
const viewingMedicine = ref<Medicine | null>(null)
const recordingMedicine = ref<Medicine | null>(null)
const activeTab = ref<'advice' | 'history'>('advice')

onMounted(() => {
  loadUsageRecords()
})

const handleSearch = () => {
  if (!inputValue.value.trim()) {
    ElMessage.warning('请输入您的症状')
    return
  }
  analyzeSymptoms(inputValue.value.trim())
}

const handleQuickSelect = (symptom: string) => {
  inputValue.value = symptom
  analyzeSymptoms(symptom)
}

const handleClear = () => {
  inputValue.value = ''
  clearResults()
}

const handleViewDetail = (recommendation: MedicineRecommendation) => {
  viewingMedicine.value = recommendation.medicine
  showDetailDialog.value = true
}

const handleRecordUsage = (recommendation: MedicineRecommendation) => {
  if (recommendation.isExpired) {
    ElMessage.warning('该药品已过期，无法记录使用')
    return
  }
  recordingMedicine.value = recommendation.medicine
  showRecordDialog.value = true
}

const handleSaveRecord = (data: {
  symptoms: string
  dosage: string
  effect: 'excellent' | 'good' | 'average' | 'poor'
  sideEffects: string
  notes: string
  familyMember: FamilyMember
}) => {
  if (!recordingMedicine.value) return
  createUsageRecord({
    medicineId: recordingMedicine.value.id,
    medicineName: recordingMedicine.value.name,
    ...data,
  })
  ElMessage.success('用药记录已保存')
  showRecordDialog.value = false
  recordingMedicine.value = null
}

const handleOpenHealthProfile = () => {
  showHealthProfile.value = true
}

const handleDeleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条用药记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    removeUsageRecord(id)
    ElMessage.success('记录已删除')
  } catch {
    // 用户取消
  }
}

const getCategoryInfo = (category: string) => {
  return CATEGORY_LIST.find((c) => c.value === category) || CATEGORY_LIST[7]
}

const getEffectInfo = (effect: string) => {
  return EFFECT_OPTIONS.find((e) => e.value === effect) || EFFECT_OPTIONS[0]
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="advice-page">
    <header class="advice-page__header">
      <div class="advice-page__header-content">
        <button class="advice-page__back-btn" @click="goBack">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <div class="advice-page__title-wrap">
          <h1 class="advice-page__title">
            <el-icon :size="28"><DataAnalysis /></el-icon>
            智能用药建议
          </h1>
          <p class="advice-page__subtitle">基于症状智能推荐，记录用药效果，积累个人经验</p>
        </div>
        <div class="advice-page__header-actions">
          <el-button
            type="success"
            :icon="User"
            @click="handleOpenHealthProfile"
            class="advice-page__health-btn"
          >
            健康档案
          </el-button>
        </div>
      </div>
    </header>

    <main class="advice-page__main">
      <div class="advice-page__tabs">
        <div
          class="advice-page__tab"
          :class="{ 'is-active': activeTab === 'advice' }"
          @click="activeTab = 'advice'"
        >
          <el-icon><Reading /></el-icon>
          用药建议
        </div>
        <div
          class="advice-page__tab"
          :class="{ 'is-active': activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          <el-icon><Edit /></el-icon>
          用药记录
        </div>
      </div>

      <div v-show="activeTab === 'advice'" class="advice-page__content">
        <DisclaimerBanner />

        <div class="advice-page__search-section">
          <div class="advice-page__search-box">
            <el-input
              v-model="inputValue"
              class="advice-page__search-input"
              placeholder="请输入您的症状，如：头疼、拉肚子、感冒发烧..."
              size="large"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon :size="20"><Search /></el-icon>
              </template>
              <template #append>
                <el-button
                  type="primary"
                  :loading="isAnalyzing"
                  @click="handleSearch"
                >
                  智能分析
                </el-button>
              </template>
            </el-input>
          </div>

          <div class="advice-page__quick-symptoms">
            <span class="advice-page__quick-label">常见症状：</span>
            <div class="advice-page__quick-list">
              <el-tag
                v-for="symptom in commonSymptomSuggestions"
                :key="symptom"
                class="advice-page__quick-tag"
                effect="plain"
                @click="handleQuickSelect(symptom)"
              >
                {{ symptom }}
              </el-tag>
            </div>
          </div>
        </div>

        <div v-if="symptomInput && matchedSymptoms.length > 0" class="advice-page__results">
          <div
            class="advice-page__severity-warning"
            :style="{
              backgroundColor: getSeverityWarning.info.bgColor,
              borderColor: getSeverityWarning.info.color,
            }"
          >
            <div class="advice-page__severity-icon" :style="{ color: getSeverityWarning.info.color }">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div class="advice-page__severity-content">
              <span
                class="advice-page__severity-badge"
                :style="{
                  backgroundColor: getSeverityWarning.info.color,
                  color: '#fff',
                }"
              >
                {{ getSeverityWarning.info.label }}
              </span>
              <span class="advice-page__severity-text">
                {{ getSeverityWarning.message }}
              </span>
            </div>
          </div>

          <div class="advice-page__matched-symptoms">
            <h3 class="advice-page__section-title">
              <el-icon><Reading /></el-icon>
              已识别的症状
            </h3>
            <div class="advice-page__symptom-cards">
              <div
                v-for="symptom in matchedSymptoms"
                :key="symptom.symptom"
                class="symptom-card"
              >
                <div class="symptom-card__header">
                  <span class="symptom-card__name">{{ symptom.symptom }}</span>
                  <span
                    class="symptom-card__severity"
                    :style="{
                      backgroundColor: SEVERITY_INFO[symptom.severity].bgColor,
                      color: SEVERITY_INFO[symptom.severity].color,
                    }"
                  >
                    {{ SEVERITY_INFO[symptom.severity].label }}
                  </span>
                </div>
                <div class="symptom-card__warning">
                  <el-icon :size="14"><Warning /></el-icon>
                  {{ symptom.warning }}
                </div>
                <div class="symptom-card__suggestions">
                  <div class="symptom-card__suggestions-title">护理建议：</div>
                  <ul>
                    <li v-for="(suggestion, index) in symptom.suggestions" :key="index">
                      {{ suggestion }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="advice-page__recommendations">
            <div class="advice-page__section-header">
              <h3 class="advice-page__section-title">
                <el-icon><FirstAidKit /></el-icon>
                推荐可用药品
                <span class="advice-page__result-count">
                  共 {{ recommendations.length }} 种
                </span>
              </h3>
              <el-button size="small" @click="handleClear">
                <el-icon><RefreshLeft /></el-icon>
                重新查询
              </el-button>
            </div>

            <div v-if="recommendations.length > 0" class="advice-page__medicine-grid">
              <div
                v-for="(rec, index) in recommendations"
                :key="rec.medicine.id"
                class="recommendation-card"
                :class="{ 'is-expired': rec.isExpired }"
              >
                <div
                  class="recommendation-card__score"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                >
                  匹配度 {{ rec.matchScore }}%
                </div>

                <div class="recommendation-card__header">
                  <div
                    class="recommendation-card__icon"
                    :style="{
                      backgroundColor: getCategoryInfo(rec.medicine.category).color + '20',
                      color: getCategoryInfo(rec.medicine.category).color,
                    }"
                  >
                    <el-icon :size="24">
                      <component
                        :is="getCategoryInfo(rec.medicine.category).icon"
                      />
                    </el-icon>
                  </div>
                  <div class="recommendation-card__info">
                    <h4 class="recommendation-card__name">{{ rec.medicine.name }}</h4>
                    <span
                      class="recommendation-card__category"
                      :style="{
                        backgroundColor: getCategoryInfo(rec.medicine.category).color + '15',
                        color: getCategoryInfo(rec.medicine.category).color,
                      }"
                    >
                      {{ getCategoryInfo(rec.medicine.category).label }}
                    </span>
                  </div>
                </div>

                <div class="recommendation-card__spec">
                  {{ rec.medicine.specification }} · 库存 {{ rec.medicine.quantity }} 盒
                </div>

                <div class="recommendation-card__expiry">
                  <span
                    class="recommendation-card__expiry-badge"
                    :style="{
                      backgroundColor: EXPIRY_STATUS_INFO[calculateExpiryStatus(rec.medicine.expiryDate).status].bgColor,
                      color: EXPIRY_STATUS_INFO[calculateExpiryStatus(rec.medicine.expiryDate).status].color,
                    }"
                  >
                    {{ EXPIRY_STATUS_INFO[calculateExpiryStatus(rec.medicine.expiryDate).status].label }}
                  </span>
                  <span class="recommendation-card__expiry-date">
                    {{ rec.medicine.expiryDate }}
                    ({{ formatDaysLeft(calculateExpiryStatus(rec.medicine.expiryDate).daysLeft) }})
                  </span>
                </div>

                <div class="recommendation-card__matched">
                  <div class="recommendation-card__matched-label">匹配症状：</div>
                  <div class="recommendation-card__matched-tags">
                    <el-tag
                      v-for="match in rec.matchedSymptoms"
                      :key="match.symptom"
                      size="small"
                      type="success"
                      effect="light"
                    >
                      {{ match.symptom }}
                    </el-tag>
                  </div>
                </div>

                <div class="recommendation-card__usage">
                  <div class="recommendation-card__usage-label">用法用量：</div>
                  <div class="recommendation-card__usage-text">{{ rec.medicine.usage }}</div>
                </div>

                <div v-if="rec.warnings.length > 0" class="recommendation-card__warnings">
                  <div class="recommendation-card__warnings-title">
                    <el-icon :size="14"><Warning /></el-icon>
                    注意事项
                  </div>
                  <ul>
                    <li
                      v-for="(warning, idx) in rec.warnings"
                      :key="idx"
                      class="recommendation-card__warning-item"
                      :class="{ 'is-danger': warning.includes('过期') }"
                    >
                      {{ warning }}
                    </li>
                  </ul>
                </div>

                <div class="recommendation-card__actions">
                  <el-button
                    size="small"
                    @click="handleViewDetail(rec)"
                  >
                    <el-icon><View /></el-icon>
                    查看详情
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="rec.isExpired"
                    @click="handleRecordUsage(rec)"
                  >
                    <el-icon><Edit /></el-icon>
                    记录用药
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty
              v-else
              class="advice-page__empty"
              description="暂无匹配的药品，请先添加相关药品到家庭药箱"
            />
          </div>
        </div>

        <div v-else-if="symptomInput && matchedSymptoms.length === 0" class="advice-page__no-match">
          <el-empty description="未能识别您输入的症状，请尝试使用更常见的症状描述，或从常见症状中选择">
            <el-button type="primary" @click="handleClear">重新输入</el-button>
          </el-empty>
        </div>

        <div v-else class="advice-page__welcome">
          <div class="advice-page__welcome-icon">
            <el-icon :size="64"><Reading /></el-icon>
          </div>
          <h3 class="advice-page__welcome-title">输入您的症状，获取智能用药建议</h3>
          <p class="advice-page__welcome-text">
            支持多种症状同时输入，系统会根据您的症状智能匹配家庭药箱中的可用药品
          </p>
          <div class="advice-page__welcome-tips">
            <div class="advice-page__welcome-tip">
              <span class="advice-page__tip-number">1</span>
              输入症状描述
            </div>
            <div class="advice-page__welcome-arrow">→</div>
            <div class="advice-page__welcome-tip">
              <span class="advice-page__tip-number">2</span>
              智能匹配药品
            </div>
            <div class="advice-page__welcome-arrow">→</div>
            <div class="advice-page__welcome-tip">
              <span class="advice-page__tip-number">3</span>
              查看用药建议
            </div>
            <div class="advice-page__welcome-arrow">→</div>
            <div class="advice-page__welcome-tip">
              <span class="advice-page__tip-number">4</span>
              记录用药效果
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'history'" class="advice-page__content">
        <DisclaimerBanner :compact="true" />

        <div class="advice-page__stats-grid">
          <div class="stat-card stat-card--total">
            <div class="stat-card__label">总记录数</div>
            <div class="stat-card__value">{{ getEffectivenessStats.total }}</div>
          </div>
          <div
            v-for="option in EFFECT_OPTIONS"
            :key="option.value"
            class="stat-card"
            :style="{ '--stat-color': option.color }"
          >
            <div class="stat-card__label">{{ option.label }}</div>
            <div class="stat-card__value">{{ getEffectivenessStats[option.value] }}</div>
          </div>
        </div>

        <div v-if="getMostUsedMedicines.length > 0" class="advice-page__insights">
          <h3 class="advice-page__section-title">
            <el-icon><Reading /></el-icon>
            用药洞察
          </h3>
          <div class="advice-page__insights-grid">
            <div class="insight-card">
              <h4 class="insight-card__title">最常用药品</h4>
              <div class="insight-card__list">
                <div
                  v-for="item in getMostUsedMedicines"
                  :key="item.name"
                  class="insight-card__item"
                >
                  <span class="insight-card__item-name">{{ item.name }}</span>
                  <span class="insight-card__item-count">{{ item.count }} 次</span>
                </div>
              </div>
            </div>
            <div v-if="getTopSymptoms.length > 0" class="insight-card">
              <h4 class="insight-card__title">高频症状</h4>
              <div class="insight-card__list">
                <div
                  v-for="item in getTopSymptoms"
                  :key="item.symptom"
                  class="insight-card__item"
                >
                  <span class="insight-card__item-name">{{ item.symptom }}</span>
                  <span class="insight-card__item-count">{{ item.count }} 次</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="advice-page__records-section">
          <h3 class="advice-page__section-title">
            <el-icon><Edit /></el-icon>
            用药记录
            <span class="advice-page__result-count">共 {{ usageRecords.length }} 条</span>
          </h3>

          <div v-if="usageRecords.length > 0" class="advice-page__records-list">
            <div
              v-for="record in usageRecords"
              :key="record.id"
              class="record-card"
            >
              <div class="record-card__header">
                <div class="record-card__medicine">
                  <span class="record-card__medicine-name">{{ record.medicineName }}</span>
                  <span
                    class="record-card__effect"
                    :style="{
                      backgroundColor: getEffectInfo(record.effect).color + '15',
                      color: getEffectInfo(record.effect).color,
                    }"
                  >
                    {{ getEffectInfo(record.effect).label }}
                  </span>
                </div>
                <span class="record-card__date">{{ record.usageDate }}</span>
              </div>
              <div class="record-card__symptoms">
                <span class="record-card__label">症状：</span>
                {{ record.symptoms }}
              </div>
              <div class="record-card__dosage">
                <span class="record-card__label">用量：</span>
                {{ record.dosage }}
              </div>
              <div v-if="record.sideEffects" class="record-card__side-effects">
                <span class="record-card__label">副作用：</span>
                {{ record.sideEffects }}
              </div>
              <div v-if="record.notes" class="record-card__notes">
                <span class="record-card__label">备注：</span>
                {{ record.notes }}
              </div>
              <div class="record-card__actions">
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDeleteRecord(record.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除记录
                </el-button>
              </div>
            </div>
          </div>

          <el-empty
            v-else
            class="advice-page__empty"
            description="暂无用药记录，记录用药效果可以帮助您积累个人用药经验"
          />
        </div>
      </div>
    </main>

    <MedicineDetail
      v-model:visible="showDetailDialog"
      :medicine="viewingMedicine"
      :tags="tagList"
    />

    <UsageRecordForm
      v-model:visible="showRecordDialog"
      :medicine="recordingMedicine"
      :default-symptoms="symptomInput"
      @save="handleSaveRecord"
    />

    <HealthProfileManager v-model:visible="showHealthProfile" />
  </div>
</template>

<style scoped lang="scss">
.advice-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);

  &__header {
    background: linear-gradient(135deg, #7ECFC0 0%, #4A90D9 50%, #357ABD 100%);
    padding: 24px 40px;
    color: #fff;
    position: relative;
  }

  &__header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  &__back-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: background var(--transition-base);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &__title-wrap {
    flex: 1;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }

  &__subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__health-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 500;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
    }
  }

  &__main {
    flex: 1;
    padding: 24px 40px 40px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  &__tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: var(--color-bg-card);
    padding: 6px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    width: fit-content;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: all var(--transition-base);

    &.is-active {
      background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }

    &:hover:not(.is-active) {
      background: var(--color-bg-hover);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__search-section {
    background: var(--color-bg-card);
    padding: 24px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  &__search-box {
    margin-bottom: 16px;
  }

  &__search-input {
    :deep(.el-input__wrapper) {
      padding: 12px 16px;
      border-radius: var(--radius-md);
      box-shadow: 0 0 0 1px var(--color-border);
    }
  }

  &__quick-symptoms {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__quick-label {
    font-size: 14px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
    padding-top: 4px;
  }

  &__quick-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
  }

  &__quick-tag {
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 13px;
    padding: 6px 14px;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__severity-warning {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    border: 1px solid;
  }

  &__severity-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__severity-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  &__severity-text {
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__result-count {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin-left: 8px;
  }

  &__symptom-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  &__medicine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  &__empty {
    padding: 60px 0;
  }

  &__no-match {
    background: var(--color-bg-card);
    padding: 40px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  &__welcome {
    background: var(--color-bg-card);
    padding: 60px 40px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  &__welcome-icon {
    color: var(--color-primary);
    margin-bottom: 20px;
    opacity: 0.8;
  }

  &__welcome-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 12px 0;
  }

  &__welcome-text {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 32px 0;
  }

  &__welcome-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__welcome-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__tip-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4A90D9 0%, #357ABD 100%);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }

  &__welcome-arrow {
    color: var(--color-text-light);
    font-size: 18px;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    --stat-color: var(--color-primary);
  }

  &__insights {
    margin-top: 8px;
  }

  &__insights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 16px;
  }

  &__records-section {
    margin-top: 8px;
  }

  &__records-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }
}

.symptom-card {
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__severity {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__warning {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 13px;
    color: #D32F2F;
    padding: 10px 12px;
    background: #FFEBEE;
    border-radius: var(--radius-sm);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  &__suggestions-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 6px;
  }

  &__suggestions {
    ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.8;

      li {
        margin-bottom: 2px;
      }
    }
  }
}

.recommendation-card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  transition: all var(--transition-base);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &.is-expired {
    opacity: 0.7;

    .recommendation-card__score {
      background: #9E9E9E;
    }
  }

  &__score {
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(135deg, #7ECFC0 0%, #4A90D9 100%);
    color: #fff;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    border-bottom-left-radius: var(--radius-lg);
    opacity: 0;
    animation: fadeInDown 0.3s ease forwards;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 24px;
    margin-bottom: 8px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  &__category {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__spec {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }

  &__expiry {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  &__expiry-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__expiry-date {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__matched {
    margin-bottom: 12px;
  }

  &__matched-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
  }

  &__matched-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__usage {
    margin-bottom: 12px;
    padding: 10px 12px;
    background: var(--color-bg-hover);
    border-radius: var(--radius-sm);
  }

  &__usage-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
  }

  &__usage-text {
    font-size: 13px;
    color: var(--color-text-primary);
    line-height: 1.6;
  }

  &__warnings {
    margin-bottom: 16px;
  }

  &__warnings-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #D32F2F;
    margin-bottom: 8px;
  }

  &__warning-item {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 4px;

    &.is-danger {
      color: #D32F2F;
      font-weight: 500;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border-light);

    .el-button {
      flex: 1;
      border-radius: var(--radius-sm);
      font-size: 13px;
    }
  }
}

.stat-card {
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  border-left: 4px solid var(--stat-color, var(--color-primary));

  &--total {
    --stat-color: #4A90D9;
  }

  &__label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: var(--stat-color, var(--color-primary));
  }
}

.insight-card {
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-light);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--color-bg-hover);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--color-primary-light);
    }
  }

  &__item-name {
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &__item-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-primary);
  }
}

.record-card {
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__medicine {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__medicine-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__effect {
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  &__date {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__symptoms,
  &__dosage,
  &__side-effects,
  &__notes {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 6px;
  }

  &__label {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border-light);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .advice-page {
    &__stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .advice-page {
    &__header {
      padding: 20px;
    }

    &__main {
      padding: 16px;
    }

    &__title {
      font-size: 20px;
    }

    &__stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    &__insights-grid {
      grid-template-columns: 1fr;
    }

    &__medicine-grid,
    &__symptom-cards {
      grid-template-columns: 1fr;
    }

    &__welcome-tips {
      flex-direction: column;
      gap: 8px;
    }

    &__welcome-arrow {
      transform: rotate(90deg);
    }
  }
}
</style>
