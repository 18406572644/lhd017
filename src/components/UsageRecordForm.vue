<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Warning, Setting, InfoFilled } from '@element-plus/icons-vue'
import type { Medicine, FamilyMember, ComprehensiveCheckResult } from '@/types/medicine'
import { EFFECT_OPTIONS, FAMILY_MEMBERS, SPECIAL_PERIOD_INFO } from '@/types/medicine'
import { useDrugInteraction } from '@/composables/useDrugInteraction'
import { useHealthProfile } from '@/composables/useHealthProfile'
import DrugInteractionAlert from '@/components/DrugInteractionAlert.vue'
import HealthProfileManager from '@/components/HealthProfileManager.vue'

interface Props {
  visible: boolean
  medicine: Medicine | null
  defaultSymptoms?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultSymptoms: '',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: {
    symptoms: string
    dosage: string
    effect: 'excellent' | 'good' | 'average' | 'poor'
    sideEffects: string
    notes: string
    familyMember: FamilyMember
  }): void
}>()

const { comprehensiveCheck, isChecking } = useDrugInteraction()
const { membersWithSpecialPeriods, loadHealthProfiles } = useHealthProfile()

const formRef = ref()
const showHealthProfile = ref(false)
const checkResult = ref<ComprehensiveCheckResult | null>(null)
const hasChecked = ref(false)

const formData = ref({
  symptoms: '',
  dosage: '',
  effect: 'good' as 'excellent' | 'good' | 'average' | 'poor',
  sideEffects: '',
  notes: '',
  familyMember: 'other' as FamilyMember,
})

const rules = {
  symptoms: [
    { required: true, message: '请输入症状', trigger: 'blur' },
  ],
  dosage: [
    { required: true, message: '请输入用法用量', trigger: 'blur' },
  ],
  effect: [
    { required: true, message: '请选择用药效果', trigger: 'change' },
  ],
  familyMember: [
    { required: true, message: '请选择使用人', trigger: 'change' },
  ],
}

const selectedMemberInfo = computed(() => {
  return FAMILY_MEMBERS.find((m) => m.value === formData.value.familyMember)
})

const selectedMemberProfile = computed(() => {
  return membersWithSpecialPeriods.value.find((m) => m.value === formData.value.familyMember)
})

const memberSpecialPeriods = computed(() => {
  if (!selectedMemberProfile.value?.specialPeriods) return []
  return selectedMemberProfile.value.specialPeriods.map(
    (period) => SPECIAL_PERIOD_INFO[period]
  )
})

const hasDangerRisk = computed(() => {
  return checkResult.value?.overallRisk === 'danger'
})

watch(() => props.visible, (val) => {
  if (val && props.medicine) {
    formData.value = {
      symptoms: props.defaultSymptoms || '',
      dosage: props.medicine.usage || '',
      effect: 'good',
      sideEffects: '',
      notes: '',
      familyMember: 'other',
    }
    checkResult.value = null
    hasChecked.value = false
    nextTick(() => {
      loadHealthProfiles()
    })
  }
})

watch(() => formData.value.familyMember, () => {
  if (hasChecked.value && props.medicine) {
    runInteractionCheck()
  }
})

const runInteractionCheck = () => {
  if (!props.medicine) return

  const member = formData.value.familyMember
  const result = comprehensiveCheck(props.medicine.name, member, 7)
  checkResult.value = result
  hasChecked.value = true

  if (result.overallRisk === 'danger') {
    ElMessage.warning('检测到严重用药风险，请仔细阅读警告信息！')
  } else if (result.overallRisk === 'caution') {
    ElMessage.info('检测到潜在用药风险，请谨慎使用。')
  }
}

const handleCheckInteraction = () => {
  runInteractionCheck()
}

const handleOpenHealthProfile = () => {
  showHealthProfile.value = true
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()

    if (!hasChecked.value) {
      runInteractionCheck()
      return
    }

    if (hasDangerRisk.value) {
      try {
        await ElMessageBox.confirm(
          '检测到严重用药风险，确定要保存此记录吗？建议先咨询医生或药师。',
          '风险确认',
          {
            confirmButtonText: '仍要保存',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger',
          }
        )
      } catch {
        return
      }
    }

    emit('save', { ...formData.value })
    handleClose()
  } catch (error) {
    ElMessage.warning('请完善必填信息')
  }
}

const effectOptions = computed(() => EFFECT_OPTIONS)
const familyMemberOptions = computed(() => FAMILY_MEMBERS)
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="记录用药效果"
    width="640px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div v-if="medicine" class="usage-record-form">
      <div class="usage-record-form__medicine-info">
        <div class="usage-record-form__medicine-name">
          {{ medicine.name }}
        </div>
        <div class="usage-record-form__medicine-spec">
          {{ medicine.specification }}
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="90px"
        class="usage-record-form__form"
      >
        <el-form-item label="使用人" prop="familyMember">
          <el-select
            v-model="formData.familyMember"
            placeholder="请选择使用人"
            class="usage-record-form__select"
          >
            <el-option
              v-for="member in familyMemberOptions"
              :key="member.value"
              :value="member.value"
              :label="member.label"
            >
              <span class="usage-record-form__option-dot" :style="{ backgroundColor: member.color }"></span>
              {{ member.label }}
            </el-option>
          </el-select>
          <el-button
            type="primary"
            link
            size="small"
            class="usage-record-form__profile-btn"
            @click="handleOpenHealthProfile"
          >
            <el-icon><Setting /></el-icon>
            设置健康档案
          </el-button>
        </el-form-item>

        <div v-if="memberSpecialPeriods.length > 0" class="usage-record-form__period-warning">
          <el-icon :size="16"><Warning /></el-icon>
          <span>
            <strong>{{ selectedMemberInfo?.label }}</strong> 当前标记：
            <el-tag
              v-for="period in memberSpecialPeriods"
              :key="period.label"
              size="small"
              :style="{ backgroundColor: period.color + '20', color: period.color, borderColor: period.color }"
            >
              {{ period.icon }} {{ period.label }}
            </el-tag>
            系统将自动检测禁忌药品
          </span>
        </div>

        <el-form-item label="症状" prop="symptoms">
          <el-input
            v-model="formData.symptoms"
            type="textarea"
            :rows="2"
            placeholder="请输入您的症状，如：头痛、发热"
          />
        </el-form-item>

        <el-form-item label="用法用量" prop="dosage">
          <el-input
            v-model="formData.dosage"
            type="textarea"
            :rows="2"
            placeholder="请输入实际使用的剂量，如：一次1粒，一日2次"
          />
        </el-form-item>

        <el-form-item label="用药效果" prop="effect">
          <el-radio-group v-model="formData.effect" class="usage-record-form__effect-group">
            <el-radio-button
              v-for="option in effectOptions"
              :key="option.value"
              :value="option.value"
              class="usage-record-form__effect-btn"
            >
              <span
                class="usage-record-form__effect-label"
                :style="{ color: option.color }"
              >
                {{ option.label }}
              </span>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="副作用">
          <el-input
            v-model="formData.sideEffects"
            type="textarea"
            :rows="2"
            placeholder="如有副作用请描述，没有则留空"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="其他需要记录的信息，如饮食注意、与其他药物联用等"
          />
        </el-form-item>
      </el-form>

      <div class="usage-record-form__check-section">
        <div class="usage-record-form__check-header">
          <h4 class="usage-record-form__check-title">
            <el-icon><Warning /></el-icon>
            药品安全检测
          </h4>
          <el-button
            type="primary"
            size="small"
            :loading="isChecking"
            @click="handleCheckInteraction"
          >
            {{ hasChecked ? '重新检测' : '开始检测' }}
          </el-button>
        </div>

        <div v-if="!hasChecked" class="usage-record-form__check-tip">
          <el-icon :size="14"><Warning /></el-icon>
          <span>保存前请先进行药品安全检测，系统将检查近7天内的用药相互作用和特殊时期禁忌</span>
        </div>

        <DrugInteractionAlert
          v-if="checkResult"
          :result="checkResult"
          :compact="false"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :class="{ 'is-danger': hasDangerRisk }">
        {{ hasChecked ? '保存记录' : '检测并保存' }}
      </el-button>
    </template>

    <HealthProfileManager v-model:visible="showHealthProfile" />
  </el-dialog>
</template>

<style scoped lang="scss">
.usage-record-form {
  &__medicine-info {
    padding: 16px 20px;
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    border-radius: var(--radius-md);
    margin-bottom: 20px;
  }

  &__medicine-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-primary-dark);
    margin-bottom: 4px;
  }

  &__medicine-spec {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__form {
    padding: 0 4px;
  }

  &__select {
    width: 100%;
  }

  &__option-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }

  &__profile-btn {
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__period-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: var(--radius-md);
    margin-bottom: 20px;
    font-size: 13px;
    color: #92400e;

    .el-icon {
      flex-shrink: 0;
      margin-top: 2px;
      color: #d97706;
    }

    .el-tag {
      margin: 0 4px;
    }
  }

  &__effect-group {
    width: 100%;
    display: flex;
    gap: 8px;
  }

  &__effect-btn {
    flex: 1;
    text-align: center;

    :deep(.el-radio-button__inner) {
      width: 100%;
      padding: 10px 8px;
      font-size: 13px;
    }
  }

  &__effect-label {
    font-weight: 500;
  }

  &__check-section {
    margin-top: 24px;
    padding: 20px;
    background: #fafafa;
    border-radius: var(--radius-md);
    border: 1px solid #e5e7eb;
  }

  &__check-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__check-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);

    .el-icon {
      color: var(--color-primary);
    }
  }

  &__check-tip {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #eff6ff;
    border: 1px dashed #93c5fd;
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: #1e40af;

    .el-icon {
      flex-shrink: 0;
      margin-top: 2px;
      color: #3b82f6;
    }
  }

  &__check-btn {
    min-width: 100px;
  }

  &__check-result {
    margin-top: 16px;
  }
}

.is-danger {
  --el-button-bg-color: #ef4444;
  --el-button-border-color: #ef4444;
  --el-button-hover-bg-color: #dc2626;
  --el-button-hover-border-color: #dc2626;
  --el-button-active-bg-color: #b91c1c;
  --el-button-active-border-color: #b91c1c;
}
</style>
