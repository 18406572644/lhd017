<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Edit, Delete, Plus, User, FirstAidKit, Warning, DataAnalysis, Close, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHealthProfile } from '@/composables/useHealthProfile'
import type { SpecialPeriodType, FamilyMember } from '@/types/medicine'
import { FAMILY_MEMBERS } from '@/types/medicine'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const {
  healthProfiles,
  selectedMember,
  selectedProfile,
  familyMembersWithProfiles,
  specialPeriodOptions,
  loadHealthProfiles,
  toggleSpecialPeriod,
  addAllergy,
  removeAllergy,
  addChronicDisease,
  removeChronicDisease,
  createProfile,
} = useHealthProfile()

const newAllergy = ref('')
const newDisease = ref('')

const allergyOptions = [
  '青霉素', '头孢类', '磺胺类', '阿司匹林', '布洛芬',
  '海鲜', '花生', '牛奶', '鸡蛋', '花粉', '尘螨',
]

const diseaseOptions = [
  '高血压', '糖尿病', '心脏病', '肝病', '肾病',
  '哮喘', '胃溃疡', '甲状腺疾病', '癫痫', '青光眼',
]

const handleClose = () => {
  emit('update:visible', false)
}

const handleSelectMember = (member: FamilyMember) => {
  selectedMember.value = member
  loadHealthProfiles()
}

const handleTogglePeriod = (period: SpecialPeriodType) => {
  if (!selectedMember.value) return
  toggleSpecialPeriod(selectedMember.value, period)
  ElMessage.success('已更新特殊时期设置')
}

const handleAddAllergy = () => {
  if (!selectedMember.value || !newAllergy.value.trim()) return
  addAllergy(selectedMember.value, newAllergy.value.trim())
  newAllergy.value = ''
  ElMessage.success('已添加过敏信息')
}

const handleRemoveAllergy = (allergy: string) => {
  if (!selectedMember.value) return
  removeAllergy(selectedMember.value, allergy)
  ElMessage.success('已删除过敏信息')
}

const handleAddDisease = () => {
  if (!selectedMember.value || !newDisease.value.trim()) return
  addChronicDisease(selectedMember.value, newDisease.value.trim())
  newDisease.value = ''
  ElMessage.success('已添加慢性病信息')
}

const handleRemoveDisease = (disease: string) => {
  if (!selectedMember.value) return
  removeChronicDisease(selectedMember.value, disease)
  ElMessage.success('已删除慢性病信息')
}

const handleQuickAddAllergy = (allergy: string) => {
  if (!selectedMember.value) return
  const hasAllergy = selectedProfile.value?.allergies.includes(allergy)
  if (hasAllergy) {
    ElMessage.warning('已存在该过敏信息')
    return
  }
  addAllergy(selectedMember.value, allergy)
  ElMessage.success('已添加过敏信息')
}

const handleQuickAddDisease = (disease: string) => {
  if (!selectedMember.value) return
  const hasDisease = selectedProfile.value?.chronicDiseases.includes(disease)
  if (hasDisease) {
    ElMessage.warning('已存在该慢性病信息')
    return
  }
  addChronicDisease(selectedMember.value, disease)
  ElMessage.success('已添加慢性病信息')
}

const selectedMemberInfo = computed(() => {
  return familyMembersWithProfiles.value.find((m) => m.value === selectedMember.value)
})

const hasAnySpecialPeriod = computed(() => {
  return healthProfiles.value.some((p) => p.specialPeriods.length > 0)
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadHealthProfiles()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="家庭成员健康档案"
    width="720px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div class="health-profile-manager">
      <div class="health-profile-manager__members">
        <h4 class="health-profile-manager__section-title">
          <el-icon><User /></el-icon>
          选择家庭成员
        </h4>
        <div class="health-profile-manager__member-list">
          <div
            v-for="member in familyMembersWithProfiles"
            :key="member.value"
            class="member-card"
            :class="{ 'is-active': selectedMember === member.value }"
            @click="handleSelectMember(member.value as FamilyMember)"
          >
            <div
              class="member-card__avatar"
              :style="{ backgroundColor: member.color + '20', color: member.color }"
            >
              {{ member.label.charAt(0) }}
            </div>
            <div class="member-card__info">
              <div class="member-card__name">{{ member.label }}</div>
              <div class="member-card__tags">
                <el-tag
                  v-if="member.hasSpecialPeriod"
                  size="small"
                  type="warning"
                  effect="light"
                >
                  {{ member.specialPeriods.length }} 项特殊时期
                </el-tag>
                <el-tag
                  v-if="member.profile?.allergies?.length"
                  size="small"
                  type="danger"
                  effect="light"
                >
                  {{ member.profile.allergies.length }} 项过敏
                </el-tag>
                <el-tag
                  v-if="member.profile?.chronicDiseases?.length"
                  size="small"
                  type="info"
                  effect="light"
                >
                  {{ member.profile.chronicDiseases.length }} 项慢病
                </el-tag>
                <span v-if="!member.hasSpecialPeriod && !member.profile?.allergies?.length && !member.profile?.chronicDiseases?.length" class="member-card__empty">
                  未设置
                </span>
              </div>
            </div>
            <el-icon class="member-card__check" v-if="selectedMember === member.value">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>

      <div v-if="selectedMember" class="health-profile-manager__details">
        <div class="health-profile-manager__section">
          <h4 class="health-profile-manager__section-title">
            <el-icon><Warning /></el-icon>
            特殊时期设置
            <span class="health-profile-manager__section-desc">
              选择后系统将自动过滤禁忌药品
            </span>
          </h4>
          <div class="health-profile-manager__period-grid">
            <div
              v-for="period in specialPeriodOptions"
              :key="period.value"
              class="period-item"
              :class="{ 'is-active': selectedProfile?.specialPeriods.includes(period.value) }"
              @click="handleTogglePeriod(period.value)"
            >
              <span class="period-item__icon">{{ period.icon }}</span>
              <div class="period-item__info">
                <div class="period-item__name">{{ period.label }}</div>
                <div class="period-item__desc">{{ period.description }}</div>
              </div>
              <el-icon class="period-item__toggle">
                <Check v-if="selectedProfile?.specialPeriods.includes(period.value)" />
                <Plus v-else />
              </el-icon>
            </div>
          </div>
        </div>

        <div class="health-profile-manager__section">
          <h4 class="health-profile-manager__section-title">
            <el-icon><FirstAidKit /></el-icon>
            过敏史
          </h4>
          <div class="health-profile-manager__input-row">
            <el-input
              v-model="newAllergy"
              placeholder="输入过敏物质，如：青霉素、海鲜等"
              size="small"
              class="health-profile-manager__input"
              @keyup.enter="handleAddAllergy"
            />
            <el-button type="primary" size="small" @click="handleAddAllergy">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
          <div class="health-profile-manager__quick-tags">
            <span class="health-profile-manager__quick-label">快速添加：</span>
            <el-tag
              v-for="allergy in allergyOptions"
              :key="allergy"
              size="small"
              :type="selectedProfile?.allergies.includes(allergy) ? 'success' : 'info'"
              :effect="selectedProfile?.allergies.includes(allergy) ? 'dark' : 'plain'"
              class="health-profile-manager__quick-tag"
              @click="handleQuickAddAllergy(allergy)"
            >
              {{ allergy }}
            </el-tag>
          </div>
          <div v-if="selectedProfile?.allergies?.length > 0" class="health-profile-manager__tag-list">
            <el-tag
              v-for="allergy in selectedProfile.allergies"
              :key="allergy"
              type="danger"
              effect="light"
              closable
              class="health-profile-manager__tag"
              @close="handleRemoveAllergy(allergy)"
            >
              {{ allergy }}
            </el-tag>
          </div>
          <el-empty
            v-else
            description="暂无过敏信息，请添加相关过敏史"
            :image-size="80"
          />
        </div>

        <div class="health-profile-manager__section">
          <h4 class="health-profile-manager__section-title">
            <el-icon><DataAnalysis /></el-icon>
            慢性病
          </h4>
          <div class="health-profile-manager__input-row">
            <el-input
              v-model="newDisease"
              placeholder="输入慢性病名称，如：高血压、糖尿病等"
              size="small"
              class="health-profile-manager__input"
              @keyup.enter="handleAddDisease"
            />
            <el-button type="primary" size="small" @click="handleAddDisease">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
          <div class="health-profile-manager__quick-tags">
            <span class="health-profile-manager__quick-label">快速添加：</span>
            <el-tag
              v-for="disease in diseaseOptions"
              :key="disease"
              size="small"
              :type="selectedProfile?.chronicDiseases.includes(disease) ? 'success' : 'info'"
              :effect="selectedProfile?.chronicDiseases.includes(disease) ? 'dark' : 'plain'"
              class="health-profile-manager__quick-tag"
              @click="handleQuickAddDisease(disease)"
            >
              {{ disease }}
            </el-tag>
          </div>
          <div v-if="selectedProfile?.chronicDiseases?.length > 0" class="health-profile-manager__tag-list">
            <el-tag
              v-for="disease in selectedProfile.chronicDiseases"
              :key="disease"
              type="warning"
              effect="light"
              closable
              class="health-profile-manager__tag"
              @close="handleRemoveDisease(disease)"
            >
              {{ disease }}
            </el-tag>
          </div>
          <el-empty
            v-else
            description="暂无慢性病信息，请添加相关疾病史"
            :image-size="80"
          />
        </div>

        <div v-if="selectedProfile" class="health-profile-manager__footer">
          <div class="health-profile-manager__update-time">
            最后更新：{{ selectedProfile.updatedAt }}
          </div>
        </div>
      </div>

      <div v-else class="health-profile-manager__empty">
        <el-empty description="请选择一位家庭成员设置健康档案" :image-size="120" />
      </div>

      <div v-if="hasAnySpecialPeriod" class="health-profile-manager__notice">
        <el-icon :size="14"><Warning /></el-icon>
        <span>
          设置特殊时期后，系统将在您记录用药时自动检测并提示禁忌药品，
          但检测结果仅供参考，用药前请务必咨询医生或药师。
        </span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.health-profile-manager {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;

  &__members {
    background: var(--color-bg-hover);
    padding: 16px;
    border-radius: var(--radius-lg);
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 12px 0;
  }

  &__section-desc {
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-secondary);
    margin-left: 8px;
  }

  &__member-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__section {
    background: var(--color-bg-card);
    padding: 16px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
  }

  &__period-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  &__input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__input {
    flex: 1;
  }

  &__quick-tags {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  &__quick-label {
    font-size: 12px;
    color: var(--color-text-secondary);
    padding-top: 4px;
    flex-shrink: 0;
  }

  &__quick-tag {
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      transform: translateY(-1px);
    }
  }

  &__tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tag {
    font-size: 13px;
    padding: 4px 10px;
  }

  &__footer {
    padding-top: 12px;
    border-top: 1px solid var(--color-border-light);
  }

  &__update-time {
    font-size: 12px;
    color: var(--color-text-secondary);
    text-align: right;
  }

  &__empty {
    padding: 40px 0;
    text-align: center;
  }

  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius-md);
    font-size: 12px;
    color: #92400e;
    line-height: 1.6;
  }
}

.member-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--color-bg-card);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  &.is-active {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-card) 100%);
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__empty {
    font-size: 11px;
    color: var(--color-text-light);
  }

  &__check {
    color: var(--color-primary);
    font-size: 16px;
  }
}

.period-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--color-bg-hover);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-border);
  }

  &.is-active {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-hover) 100%);
  }

  &__icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
  }

  &__desc {
    font-size: 11px;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  &__toggle {
    color: var(--color-text-secondary);
    font-size: 16px;
    flex-shrink: 0;
    transition: all var(--transition-fast);
  }

  &.is-active &__toggle {
    color: var(--color-primary);
  }
}

@media (max-width: 640px) {
  .health-profile-manager {
    &__member-list {
      grid-template-columns: repeat(2, 1fr);
    }

    &__period-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
